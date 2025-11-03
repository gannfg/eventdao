'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import styles from './page.module.css';

export default function TestGeminiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'found' | 'missing'>('checking');

  // Check API key status on mount (will be determined after first test)
  useEffect(() => {
    setApiKeyStatus('checking');
  }, []);

  const testGeminiAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Sample event for testing
    const testEvent = {
      id: 'test-event-123',
      title: 'Tesla Cybertruck First Delivery Event',
      description: 'Tesla will deliver the first Cybertruck units to customers at a special event on November 30, 2023, at the Tesla Gigafactory in Texas.',
      date: new Date().toISOString(),
      location: 'Tesla Gigafactory, Texas, USA',
      category: 'Conference',
      event_url: 'https://www.tesla.com',
      status: 'active' as const,
      authentic_stake: 100,
      hoax_stake: 20,
      bond: 5,
      time_left: '5d',
      media_files: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'test-user',
    };

    try {
      const startTime = Date.now();
      const response = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: testEvent }),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API returned status ${response.status}`);
      }

      setResult({
        ...data,
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      });

      if (data.result === 'uncertain' && data.reasoning?.includes('not configured')) {
        setApiKeyStatus('missing');
        setError('⚠️ GEMINI_API_KEY is not configured. Check your .env.local file.');
      } else {
        setApiKeyStatus('found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setResult({
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      setApiKeyStatus('missing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Gemini AI Integration Test</h1>
          <p>Test the Google Gemini AI API integration for event verification</p>
        </div>

        <div className={styles.statusCard}>
          <h2>API Key Status</h2>
          <div className={styles.statusIndicator}>
            {apiKeyStatus === 'checking' && (
              <span className={styles.statusText}>Checking...</span>
            )}
            {apiKeyStatus === 'found' && (
              <>
                <span className={`${styles.statusDot} ${styles.green}`}></span>
                <span className={styles.statusText}>API Key Configured ✓</span>
              </>
            )}
            {apiKeyStatus === 'missing' && (
              <>
                <span className={`${styles.statusDot} ${styles.red}`}></span>
                <span className={styles.statusText}>API Key Missing ✗</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.testCard}>
          <h2>Test Event Verification</h2>
          <p>Click the button below to test the Gemini AI integration with a sample event:</p>
          
          <div className={styles.sampleEvent}>
            <h3>Sample Event:</h3>
            <ul>
              <li><strong>Title:</strong> Tesla Cybertruck First Delivery Event</li>
              <li><strong>Description:</strong> Tesla will deliver the first Cybertruck units...</li>
              <li><strong>Location:</strong> Tesla Gigafactory, Texas, USA</li>
              <li><strong>Category:</strong> Conference</li>
            </ul>
          </div>

          <button
            className={styles.testButton}
            onClick={testGeminiAPI}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Gemini API'}
          </button>
        </div>

        {error && (
          <div className={styles.errorCard}>
            <h2>❌ Error</h2>
            <pre className={styles.errorText}>{error}</pre>
          </div>
        )}

        {result && (
          <div className={styles.resultCard}>
            <h2>✅ API Response</h2>
            <div className={styles.resultInfo}>
              <div className={styles.resultRow}>
                <span className={styles.label}>Status Code:</span>
                <span className={styles.value}>{result.statusCode || 'N/A'}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.label}>Response Time:</span>
                <span className={styles.value}>{result.responseTime}ms</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.label}>Timestamp:</span>
                <span className={styles.value}>
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.resultData}>
              <h3>Verification Result</h3>
              <div className={styles.resultRow}>
                <span className={styles.label}>Result:</span>
                <span className={`${styles.value} ${styles[result.result]}`}>
                  {result.result?.toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.label}>Confidence:</span>
                <span className={styles.value}>{result.confidence || 'N/A'}%</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.label}>Reasoning:</span>
                <span className={styles.value}>{result.reasoning || 'N/A'}</span>
              </div>
              {result.sources && result.sources.length > 0 && (
                <div className={styles.resultRow}>
                  <span className={styles.label}>Sources:</span>
                  <ul className={styles.sourcesList}>
                    {result.sources.map((source: string, index: number) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <details className={styles.rawData}>
              <summary>Raw JSON Response</summary>
              <pre className={styles.jsonCode}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className={styles.instructionsCard}>
          <h2>🔍 Troubleshooting</h2>
          <ul>
            <li>
              <strong>API Key Missing:</strong> Make sure <code>.env.local</code> exists in the{' '}
              <code>frontend</code> directory with <code>GEMINI_API_KEY=your-key-here</code>
            </li>
            <li>
              <strong>Restart Server:</strong> After adding/changing the API key, restart your Next.js dev server
            </li>
            <li>
              <strong>Check API Key Format:</strong> The key should start with <code>AIza</code>
            </li>
            <li>
              <strong>Network Issues:</strong> Check your internet connection and Google Cloud status
            </li>
            <li>
              <strong>Rate Limits:</strong> Free tier has 60 requests/minute limit. If you hit this, wait a minute and try again
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

