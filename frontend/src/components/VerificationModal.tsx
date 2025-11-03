'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { EventService } from '../lib/event-service';
import { Event } from '@eventdao/shared';
import styles from './VerificationModal.module.css';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  userId: string;
  onVoteSuccess?: () => void;
}

interface AIVerificationResult {
  result: 'true' | 'false' | 'uncertain';
  confidence: number;
  reasoning: string;
  sources?: string[];
}

export default function VerificationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  userId,
  onVoteSuccess,
}: VerificationModalProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [aiVerification, setAiVerification] = useState<AIVerificationResult | null>(null);
  const [aiVerifying, setAiVerifying] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState<any>(null);
  const [loadingExistingVerification, setLoadingExistingVerification] = useState(true);
  const hasAutoVerifiedRef = useRef(false);

  const fetchEventStatus = async () => {
    try {
      setLoadingExistingVerification(true);
      // Try to fetch status columns, but handle missing columns gracefully
      const { data, error } = await supabase
        .from('events')
        .select('id, resolution_status, final_result, verification_window_open, ai_verification_result, ai_verification_confidence, ai_verification_timestamp')
        .eq('id', eventId)
        .maybeSingle();

      if (error) {
        // If columns don't exist (error code 42703), use defaults
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          // Set defaults - columns don't exist in database yet
          setEventStatus({
            resolution_status: 'pending',
            verification_window_open: true,
          });
          setLoadingExistingVerification(false);
          return;
        }
        // Other errors - still use defaults
        setEventStatus({
          resolution_status: 'pending',
          verification_window_open: true,
        });
        setLoadingExistingVerification(false);
        return;
      }

      // Merge with defaults in case some columns are missing
      const status = {
        resolution_status: data?.resolution_status || 'pending',
        final_result: data?.final_result || null,
        verification_window_open: data?.verification_window_open ?? true,
        ai_verification_result: data?.ai_verification_result || null,
        ai_verification_confidence: data?.ai_verification_confidence || null,
        ai_verification_timestamp: data?.ai_verification_timestamp || null,
      };
      
      setEventStatus(status);
      
      // If there's existing verification, load it immediately
      if (status.ai_verification_result) {
        const timestamp = status.ai_verification_timestamp
          ? new Date(status.ai_verification_timestamp).toLocaleString()
          : 'Previously';
        
        setAiVerification({
          result: status.ai_verification_result as 'true' | 'false' | 'uncertain',
          confidence: status.ai_verification_confidence || 50,
          reasoning: `Verified on ${timestamp}. The AI has analyzed this event and determined the result.`,
          sources: [],
        });
        hasAutoVerifiedRef.current = true; // Prevent auto-verifying
      }
      
      setLoadingExistingVerification(false);
    } catch (error) {
      // On any error, use safe defaults
      setEventStatus({
        resolution_status: 'pending',
        verification_window_open: true,
      });
      setLoadingExistingVerification(false);
    }
  };

  const fetchEventData = async () => {
    try {
      const eventData = await EventService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setAiError('Failed to load event data');
    }
  };

  const verifyWithAI = useCallback(async () => {
    if (!event) {
      setAiError('Event data not loaded. Please wait...');
      return;
    }

    setAiVerifying(true);
    setAiError(null);
    setAiVerification(null);

    try {
      const response = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API returned status ${response.status}`);
      }

      const result: AIVerificationResult = await response.json();
      setAiVerification(result);

      // Try to save AI verification to database (if columns exist)
      try {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            ai_verification_result: result.result,
            ai_verification_confidence: result.confidence,
            ai_verification_timestamp: new Date().toISOString(),
          })
          .eq('id', eventId);

        if (updateError) {
          // Only log if it's not a "column doesn't exist" error
          if (updateError.code !== 'PGRST204' && !updateError.message?.includes('does not exist')) {
            console.warn('Could not save AI verification to database:', updateError);
          }
          // Don't throw - AI verification was successful, just couldn't save to DB
        }
      } catch (dbError) {
        // Silently handle database errors - AI verification result is still displayed
        console.warn('Database update skipped (columns may not exist):', dbError);
      }

      // Don't call onVoteSuccess immediately - it might close the modal
      // Instead, call it after a delay or let the user close manually
      // if (onVoteSuccess) {
      //   onVoteSuccess();
      // }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI verification failed');
      console.error('AI verification error:', err);
    } finally {
      setAiVerifying(false);
    }
  }, [event, eventId]);

  useEffect(() => {
    if (isOpen) {
      // Reset error state, but keep verification if it exists
      setAiError(null);
      // Don't reset aiVerification immediately - check database first
      hasAutoVerifiedRef.current = false;
      fetchEventStatus();
      fetchEventData();
    }
  }, [isOpen, eventId]);

  // Note: Loading existing verification is now handled in fetchEventStatus for immediate display

  // Auto-verify when event data is loaded and no existing verification
  useEffect(() => {
    if (isOpen && event && eventStatus && !aiVerification && !aiVerifying && !hasAutoVerifiedRef.current && !eventStatus?.ai_verification_result) {
      hasAutoVerifiedRef.current = true;
      verifyWithAI();
    }
  }, [isOpen, event, eventStatus, aiVerification, aiVerifying, verifyWithAI]);

  if (!isOpen) return null;

  const isEventResolved = eventStatus?.resolution_status === 'resolved' || false;
  const isVerifiedClosed = eventStatus?.verification_window_open === false;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Verify Event</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{eventTitle}</h3>
            <div className={styles.statusBadge}>
              {isEventResolved 
                ? `✓ RESOLVED: ${eventStatus?.final_result?.toUpperCase()}`
                : 'Verification Phase'}
            </div>
          </div>

          {/* AI Verification Section */}
          {!isEventResolved && (
            <div className={styles.aiVerificationSection}>
              <div className={styles.aiHeader}>
                <h4 className={styles.aiTitle}>🤖 AI Verification</h4>
              </div>

              {aiVerifying && (
                <div className={styles.aiLoading}>
                  <div className={styles.spinner}></div>
                  <span>Analyzing event with Gemini AI...</span>
                </div>
              )}

              {aiError && (
                <div className={styles.aiError}>
                  ⚠️ {aiError}
                  <button
                    className={styles.aiRetryButton}
                    onClick={verifyWithAI}
                    disabled={aiVerifying || !event}
                    style={{ marginTop: '12px' }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {aiVerification && !aiVerifying && (
                <div className={styles.aiResult}>
                  <div className={styles.aiResultHeader}>
                    <span className={`${styles.aiResultBadge} ${styles[aiVerification.result]}`}>
                      {aiVerification.result.toUpperCase()}
                    </span>
                    <span className={styles.aiConfidence}>
                      {aiVerification.confidence}% Confidence
                    </span>
                  </div>
                  <div className={styles.aiReasoning}>
                    <strong>Analysis:</strong> {aiVerification.reasoning}
                  </div>
                  {aiVerification.sources && aiVerification.sources.length > 0 && (
                    <div className={styles.aiSources}>
                      <strong>Sources:</strong>
                      <ul>
                        {aiVerification.sources.map((source, index) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    className={styles.aiRetryButton}
                    onClick={verifyWithAI}
                    disabled={aiVerifying || !event}
                  >
                    Re-verify with AI
                  </button>
                </div>
              )}

              {loadingExistingVerification && !aiVerification && (
                <div className={styles.aiWaiting}>
                  <div className={styles.spinner}></div>
                  <span>Checking for existing verification...</span>
                </div>
              )}

              {!loadingExistingVerification && !aiVerification && !aiVerifying && !aiError && !eventStatus?.ai_verification_result && (
                <div className={styles.aiWaiting}>
                  <div className={styles.spinner}></div>
                  <span>Preparing AI verification...</span>
                </div>
              )}
            </div>
          )}

          {isEventResolved && (
            <div className={styles.notice}>
              This event has been resolved. You can view the results below.
            </div>
          )}

          {isVerifiedClosed && !isEventResolved && (
            <div className={styles.notice}>
              Verification window is closed. Waiting for resolution.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={aiVerifying}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
