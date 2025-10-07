import Image from "next/image";
import styles from './page.module.css';

export default function SubmitPage() {
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
          <a href="/" className={styles.navLink}>Home</a>
          <a href="/submit" className={styles.navLink}>Submit</a>
          <a href="/explore" className={styles.navLink}>Explore</a>
          <a href="/leaderboard" className={styles.navLink}>Leaderboard</a>
          <a href="/wallet" className={styles.navLink}>Wallet</a>
          <a href="#" className={styles.navLink}>Admin</a>
          <a href="/about" className={styles.navLink}>About</a>
        </nav>
        <div className={styles.actions}>
          <button className={styles.initializeBtn}>Initialize DAO</button>
          <button className={styles.walletBtn}>
            <span className={styles.walletIcon}>👻</span>
            <span>6vWi...r6GK</span>
          </button>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.formHeader}>
          <h1 className={styles.title}>Submit an Event</h1>
          <p className={styles.subtitle}>
            Submit an event for community verification. Stake a bond to ensure quality submissions.
          </p>
        </div>

        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="eventTitle" className={styles.label}>
              Event Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="eventTitle"
              className={styles.input}
              placeholder="e.g., Coldplay Concert Jakarta 2025"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder="Describe the event details..."
              rows={4}
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
              className={styles.input}
              placeholder="https://example.com/event-details (optional)"
            />
            <p className={styles.helpText}>
              Optional: Provide official event URL or ticketing link for verification
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category <span className={styles.required}>*</span>
            </label>
            <select id="category" className={styles.select} required>
              <option value="">Select a category</option>
              <option value="concert">Concert</option>
              <option value="festival">Festival</option>
              <option value="conference">Conference</option>
              <option value="sports">Sports</option>
              <option value="exhibition">Exhibition</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="eventDate" className={styles.label}>
              Event Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="eventDate"
              className={styles.input}
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
              className={styles.input}
              placeholder="e.g., Jakarta Convention Center, Indonesia"
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
              className={styles.input}
              step="0.1"
              min="0.1"
              defaultValue="0.1"
              required
            />
            <p className={styles.helpText}>
              Bond will be slashed if the event is proven to be fake or misleading
            </p>
          </div>

          <div className={styles.mediaSection}>
            <h3 className={styles.mediaTitle}>Event Media (Photos & Videos)</h3>
            <div className={styles.uploadArea}>
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
            </div>
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
            <button type="submit" className={styles.submitBtn}>
              Submit Event
            </button>
            <a href="/" className={styles.cancelBtn}>
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
