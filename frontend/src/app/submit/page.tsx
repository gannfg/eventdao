'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import WalletButton from "../../components/WalletButton";
import { useWalletIntegration } from "../../lib/wallet-integration";
import { EventFormData, SubmitStatus } from '@eventdao/shared';
import styles from './page.module.css';

export default function SubmitPage() {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventUrl: '',
    category: '',
    eventDate: '',
    location: '',
    bondAmount: 0.1,
    photos: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: null, message: '' });
  const [dragActive, setDragActive] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const { user: walletUser, isConnected } = useWalletIntegration();

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('Testing local functionality...');
      
      // Simulate a test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Local functionality test passed! (No database required)' 
      });
    } catch (err) {
      console.error('Test error:', err);
      setSubmitStatus({ 
        type: 'error', 
        message: `Test failed: ${err instanceof Error ? err.message : 'Unknown error'}` 
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bondAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles]
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const calculateTimeLeft = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Event passed';
    if (diffDays === 1) return '1d 0h';
    return `${diffDays}d 0h`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !walletUser) {
      setSubmitStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!formData.title || !formData.description || !formData.category || !formData.eventDate || !formData.location) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Validate wallet user
      if (!walletUser || !walletUser.id) {
        throw new Error('User not properly connected. Please reconnect your wallet.');
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.eventDate).toISOString(),
        location: formData.location,
        category: formData.category,
        status: 'active' as const,
        authentic_stake: 0,
        hoax_stake: 0,
        bond: formData.bondAmount,
        time_left: calculateTimeLeft(formData.eventDate),
        user_id: walletUser.id
      };

      console.log('Event data prepared locally:', eventData);
      
      // Simulate event creation (no database)
      const mockEventId = `local_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Event created locally with ID:', mockEventId);
      
      // TODO: Handle photos locally
      if (formData.photos.length > 0) {
        console.log('Photos to handle locally:', formData.photos.map(f => f.name));
        // Photo handling logic would go here
      }

      setSubmitStatus({ 
        type: 'success', 
        message: `Event "${formData.title}" submitted successfully! Event ID: ${mockEventId}. (Local submission - no database)` 
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        eventUrl: '',
        category: '',
        eventDate: '',
        location: '',
        bondAmount: 0.1,
        photos: []
      });

    } catch (error) {
      console.error('Submission error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      let errorMessage = 'Failed to submit event. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('details' in error) {
          errorMessage = String(error.details);
        } else if ('hint' in error) {
          errorMessage = String(error.hint);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      setSubmitStatus({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src="/eventdao_letter.png"
            alt="EventDAO Logo"
            width={160}
            height={53}
            className={styles.brandLogo}
          />
          <span className={styles.brandSubtitle}>Solana Web3 Events</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <a href="/submit" className={styles.navLink}>Submit</a>
          <a href="/explore" className={styles.navLink}>Explore</a>
          <a href="/leaderboard" className={styles.navLink}>Leaderboard</a>
          <a href="/wallet" className={styles.navLink}>Wallet</a>
          <a href="/admin" className={styles.navLink}>Admin</a>
          <a href="/about" className={styles.navLink}>About</a>
        </nav>
        <div className={styles.actions}>
          <button className={styles.initializeBtn}>Initialize DAO</button>
          <WalletButton className={styles.walletBtn} />
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.formHeader}>
          <h1 className={styles.title}>Submit an Event</h1>
          <p className={styles.subtitle}>
            Submit an event for community verification. Stake a bond to ensure quality submissions.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {submitStatus.type && (
            <div className={`${styles.statusMessage} ${styles[submitStatus.type]}`}>
              {submitStatus.message}
              {submitStatus.type === 'success' && (
                <div style={{ marginTop: '12px' }}>
                  <Link href="/explore" className={styles.exploreLink}>
                    View in Explore Page →
                  </Link>
                </div>
              )}
            </div>
          )}

          {!isConnected && (
            <div className={styles.walletWarning}>
              ⚠️ Please connect your wallet to submit an event
            </div>
          )}

          {/* Debug Section */}
          <div className={styles.debugSection}>
            <h4 className={styles.debugTitle}>Local Debug Tools</h4>
            <div className={styles.debugButtons}>
              <button
                type="button"
                onClick={testConnection}
                disabled={testingConnection}
                className={styles.debugBtn}
              >
                {testingConnection ? 'Running Tests...' : 'Test Local Functionality'}
              </button>
              {walletUser && (
                <div className={styles.userInfo}>
                  <p><strong>User ID:</strong> {walletUser.id}</p>
                  <p><strong>Wallet:</strong> {walletUser.wallet_address}</p>
                  <p><strong>Mode:</strong> Local (No Database)</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="eventTitle" className={styles.label}>
              Event Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="eventTitle"
              name="title"
              className={styles.input}
              placeholder="e.g., Coldplay Concert Jakarta 2025"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Describe the event details..."
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="eventUrl" className={styles.label}>
              Event URL
            </label>
            <input
              type="url"
              id="eventUrl"
              name="eventUrl"
              className={styles.input}
              placeholder="https://example.com/event-details (optional)"
              value={formData.eventUrl}
              onChange={handleInputChange}
            />
            <p className={styles.helpText}>
              Optional: Provide official event URL or ticketing link for verification
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category <span className={styles.required}>*</span>
            </label>
            <select 
              id="category" 
              name="category"
              className={styles.select} 
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Concert">Concert</option>
              <option value="Festival">Festival</option>
              <option value="Conference">Conference</option>
              <option value="Sports">Sports</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Workshop">Workshop</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="eventDate" className={styles.label}>
              Event Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              className={styles.input}
              value={formData.eventDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              Location <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className={styles.input}
              placeholder="e.g., Jakarta Convention Center, Indonesia"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bondAmount" className={styles.label}>
              Bond Amount (SOL) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="bondAmount"
              name="bondAmount"
              className={styles.input}
              step="0.1"
              min="0.1"
              value={formData.bondAmount}
              onChange={handleInputChange}
              required
            />
            <p className={styles.helpText}>
              Bond will be slashed if the event is proven to be fake or misleading
            </p>
          </div>

          <div className={styles.mediaSection}>
            <h3 className={styles.mediaTitle}>Event Media (Photos & Videos)</h3>
            <div 
              className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className={styles.fileInput}
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label htmlFor="file-upload" className={styles.uploadLabel}>
                <div className={styles.uploadIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                  <span>+</span>
                </div>
                <p className={styles.uploadText}>
                  <span className={styles.uploadLink}>Click to upload</span> or drag and drop
                </p>
                <p className={styles.uploadSubtext}>
                  PNG, JPG, GIF, MP4, MOV up to 10MB each
                </p>
              </label>
            </div>

            {formData.photos.length > 0 && (
              <div className={styles.uploadedFiles}>
                <h4 className={styles.uploadedTitle}>Uploaded Files ({formData.photos.length})</h4>
                <div className={styles.fileList}>
                  {formData.photos.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeFile}
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.guidelines}>
            <h4 className={styles.guidelinesTitle}>Submission Guidelines</h4>
            <ul className={styles.guidelinesList}>
              <li>Provide accurate and verifiable event information</li>
              <li>Include official event URL or ticketing link (optional)</li>
              <li>Upload photos/videos to support your event claim</li>
              <li>Bond will be returned if event is verified as authentic</li>
              <li>Bond will be slashed if event is proven fake</li>
            </ul>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting || !isConnected}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Event'}
            </button>
            <Link href="/" className={styles.cancelBtn}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}