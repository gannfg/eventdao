'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import styles from "./page.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Home() {
  // Simple FAQ accordion behavior without interfering with scroll
  useEffect(() => {
    const handleDetailsToggle = (event: Event) => {
      try {
        const details = event.target as HTMLDetailsElement;
        
        if (details && details.closest('.faq')) {
          // Close all other FAQ details when one opens
          if (details.open) {
            const allDetails = document.querySelectorAll('.faq details') as NodeListOf<HTMLDetailsElement>;
            allDetails.forEach(d => {
              if (d !== details) {
                d.open = false;
              }
            });
          }
        }
      } catch (error) {
        console.error('Error in FAQ toggle handler:', error);
      }
    };

    try {
      const detailsElements = document.querySelectorAll('.faq details') as NodeListOf<HTMLDetailsElement>;
      detailsElements.forEach(details => {
        details.addEventListener('toggle', handleDetailsToggle);
      });

      return () => {
        detailsElements.forEach(details => {
          details.removeEventListener('toggle', handleDetailsToggle);
        });
      };
    } catch (error) {
      console.error('Error setting up FAQ event listeners:', error);
      return () => {};
    }
  }, []);

  return (
    <div className={styles.page}>
      <Header currentPage="home" />

      <main className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src="/eventdao.png"
            alt="EventDAO Hero"
            width={1000}
            height={750}
            priority
            className={styles.heroImageContent}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      </main>


      <section className={styles.section} id="about">
        <h1 className={styles.headline}>Combat Misinformation with Blockchain Truth.</h1>
        <p className={styles.subheadline}>
          EventDAO is a decentralized platform that incentivizes users to find and verify the truth. Instead of relying on centralized fact-checkers, EventDAO allows the community to collectively validate real-world events, news, and rumors using blockchain transparency and AI-powered verification.
        </p>
        <div className={styles.ctaRow}>
          <a className={styles.primaryBtn} href="/submit">🧠 Submit Truth Claim</a>
          <a className={styles.secondaryBtn} href="/explore">🔍 Explore Claims</a>
        </div>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                <path d="M9 9h6v6H9z"/>
              </svg>
            </div>
            <h3>AI-Powered Verification</h3>
            <p>Automatically analyze claims using NewsData.io to detect related coverage and credible sources</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <path d="M8 21l4-7 4 7"/>
              </svg>
            </div>
            <h3>Collective Intelligence</h3>
            <p>Community stakes tokens to express judgment on Fact vs Hoax, creating balanced truth-seeking ecosystem</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55.47.98.97 1.21l2.97 1.35c.42.19.87.19 1.29 0l2.97-1.35c.5-.23.97-.66.97-1.21v-2.34"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
            <h3>Reputation System</h3>
            <p>Earn reputation points for accuracy, with higher reputation increasing future rewards and credibility</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>7-Day Resolution</h3>
            <p>Time-bound verification with automatic monitoring of credible sources like BBC, CNN, Reuters</p>
          </div>
        </div>
      </section>

      {/* Removed descriptive lead section per request */}

      {/* Content sections */}

      <section className={styles.section} id="video">
        <div className={styles.videoFrame} aria-label="Video demo">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/2g9Zw1QWEt4?si=Un0abQ0jHsylMscA&autoplay=1&loop=1&playlist=2g9Zw1QWEt4&mute=1&controls=0"
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      <section className={styles.section} id="faq">
        <h3>FAQ</h3>
        <div className={styles.faq}>
          <details className={styles.faqItem}>
            <summary>What is EventDAO?</summary>
            <p>EventDAO is a decentralized platform that combats misinformation by incentivizing users to find and verify the truth. Instead of relying on centralized fact-checkers, EventDAO allows the community to collectively validate real-world events, news, and rumors using blockchain transparency and AI-powered verification.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>How does truth verification work?</summary>
            <p>Users submit claims and stake tokens as a commitment to truth discovery. The community then stakes tokens to express judgment on Fact vs Hoax. EventDAO&apos;s AI continuously monitors credible sources like BBC, CNN, Reuters, and domain-specific authorities. After 7 days, claims are resolved based on verifiable evidence, and tokens from incorrect stakes are redistributed to those who were correct.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>What sources does EventDAO use for verification?</summary>
            <p>EventDAO&apos;s AI (powered by NewsData.io) monitors credible news sources including BBC, CNN, Reuters, government social media, verified experts, and domain-specific authorities to ensure accurate verification of claims.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>Is this gambling or betting?</summary>
            <p>No. EventDAO uses staking as a way to verify truth — not as a form of gambling. It&apos;s about truth verification, transparency, and collective intelligence. Users stake tokens as a commitment to truth discovery, and those who choose correctly are rewarded for contributing to collective accuracy.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>How does the reputation system work?</summary>
            <p>Users earn reputation points for submitting accurate information or making correct verifications. Higher reputation increases future rewards, while users with low reputation (due to repeated false submissions) lose credibility and can eventually lose the right to submit new events.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>What kind of claims can I submit?</summary>
            <p>EventDAO focuses on time-sensitive, verifiable events such as product launches, sports matches, concerts, public statements, press releases, and real-world incidents. We encourage posting only events with near-term outcomes, not speculative predictions.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>How do rewards work?</summary>
            <p>When a claim is resolved, those who staked correctly share the redistributed tokens from incorrect stakes. Users also earn reputation points for accuracy, with higher reputation increasing future rewards. The system automatically rewards active truth-seekers and penalizes misinformation.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>What happens if news changes after resolution?</summary>
            <p>EventDAO introduces a &quot;Mutable News&quot; tag for stories that evolve after resolution. If credible updates arise, the system logs a new version rather than overwriting the old one, ensuring a transparent record of truth evolution.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>Why build on Solana?</summary>
            <p>Solana offers fast, low-cost transactions — perfect for real-time truth verification, collective intelligence systems, and transparent token redistribution at scale.</p>
          </details>
        </div>
      </section>

      <section className={styles.roadmapSection} id="roadmap">
        <div className={styles.roadmapHeader}>
          <h3>Our Roadmap</h3>
          <p>Here is our development phases that will guide EventDAO to become the global standard for truth verification.</p>
        </div>
        <div className={styles.roadmapCards}>
          <div className={`${styles.roadmapCard} ${styles.foundationCard}`}>
            <div className={styles.cardIcon}>🏗️</div>
            <h4>Phase 1 — Foundation</h4>
            <p>For those who want to build the core infrastructure for trustless event verification.</p>
            <div className={styles.cardArrow}>→</div>
          </div>
          <div className={`${styles.roadmapCard} ${styles.ecosystemCard}`}>
            <div className={styles.cardIcon}>🌐</div>
            <h4>Phase 2 — Ecosystem</h4>
            <p>For those who want to expand partnerships and community features.</p>
            <div className={styles.cardArrow}>→</div>
          </div>
          <div className={`${styles.roadmapCard} ${styles.globalCard}`}>
            <div className={styles.cardIcon}>🌍</div>
            <h4>Phase 3 — Global Standard</h4>
            <p>For those who want to establish EventDAO as the universal truth verification platform.</p>
            <div className={styles.cardArrow}>→</div>
          </div>
        </div>
        <div className={styles.roadmapCallToAction}>
          <h2>KEEP BUILDING UNTIL YOU FIND YOUR TRUTH</h2>
          <p>EventDAO Team</p>
        </div>
      </section>

      <section className={styles.joinMovementSection} id="cta">
        <div className={styles.joinMovementContainer}>
          <div className={styles.illustrationContainer}>
            <Image
              src="/join_the_movement.png"
              alt="Join the Movement Illustration"
              width={600}
              height={450}
              className={styles.illustration}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 600px"
            />
            
            <div className={styles.overlayButtons}>
              <a className={styles.primaryBtn} href="/submit">Submit a Claim</a>
              <a className={styles.secondaryBtn} href="/explore">Explore Claims</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}