import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import Footer from "../components/Footer";

// Dynamic import for Header to reduce initial bundle size
const Header = dynamic(() => import("../components/Header"), {
  ssr: true,
  loading: () => <div style={{ height: "120px" }} />
});

export default function Home() {
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
        <h2>⚡ EventDAO — Proof of Event on Solana</h2>
        <h1 className={styles.headline}>Make Every Event Verifiable.</h1>
        <p className={styles.subheadline}>
          EventDAO lets you prove that real-world events truly happened — verified on Solana, rewarded with NFTs.
        </p>
        <div className={styles.ctaRow}>
          <a className={styles.primaryBtn} href="/submit">🎟️ Start a Claim</a>
          <a className={styles.secondaryBtn} href="/explore">🔍 View Events</a>
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
            <p>EventDAO is a platform that verifies real-world events on Solana. Users can submit event claims, stake to support or dispute them, and earn rewards when verified.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>How does event verification work?</summary>
            <p>Each event claim is checked through trusted data sources — such as ticket APIs, news feeds, or oracles — to confirm whether it truly happened.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>What is a Proof of Attendance NFT?</summary>
            <p>It&apos;s a collectible NFT that proves you were part of an event. You can keep it as a digital memory or show it off on-chain.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>Do I need crypto to use EventDAO?</summary>
            <p>Yes, you&apos;ll need a Solana wallet and a small amount of SOL for staking or minting. However, we&apos;re working on wallet-free onboarding for new users.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>Is this gambling or betting?</summary>
            <p>No. EventDAO uses staking as a way to verify claims — not as a form of gambling. It&apos;s about truth verification, transparency, and proof of participation.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>What kind of events can I submit?</summary>
            <p>Concerts, festivals, conferences, sports games — any real-world event that can be verified publicly.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>How do rewards work?</summary>
            <p>When a claim is confirmed, those who staked correctly share the reward pool. This keeps the ecosystem fair and community-driven.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>Why build on Solana?</summary>
            <p>Solana offers fast, low-cost transactions — perfect for event verification and NFT minting at scale.</p>
          </details>
        </div>
      </section>

      <section className={styles.roadmapSection} id="roadmap">
        <div className={styles.roadmapContainer}>
          <Image
            src="/roadmap_design.png"
            alt="EventDAO Roadmap Journey"
            width={1000}
            height={1500}
            className={styles.roadmapImageContent}
          />
          <div className={styles.roadmapTextOverlay} data-phase="1">
            <h4>Phase 1 — Foundation</h4>
            <p>Core event verification system with staking mechanics, automatic resolution through APIs, and NFT proof-of-attendance minting. Building the essential infrastructure for trustless event verification.</p>
          </div>
          <div className={styles.roadmapTextOverlay} data-phase="2">
            <h4>Phase 2 — Ecosystem</h4>
            <p>Partner with event organizers, venues, and ticketing platforms. Launch community leaderboards, achievement systems, and sponsor partnerships. Expand beyond crypto-native events.</p>
          </div>
          <div className={styles.roadmapTextOverlay} data-phase="3">
            <h4>Phase 3 — Global Standard</h4>
            <p>Establish EventDAO as the universal standard for verifiable event attendance. Scale to millions of events worldwide, with seamless integration across all major platforms and industries.</p>
          </div>
        </div>
        <div className={styles.roadmapMobilePhases}>
          <div className={styles.roadmapMobilePhase}>
            <h4>Phase 1 — Foundation</h4>
            <p>Core event verification system with staking mechanics, automatic resolution through APIs, and NFT proof-of-attendance minting. Building the essential infrastructure for trustless event verification.</p>
          </div>
          <div className={styles.roadmapMobilePhase}>
            <h4>Phase 2 — Ecosystem</h4>
            <p>Partner with event organizers, venues, and ticketing platforms. Launch community leaderboards, achievement systems, and sponsor partnerships. Expand beyond crypto-native events.</p>
          </div>
          <div className={styles.roadmapMobilePhase}>
            <h4>Phase 3 — Global Standard</h4>
            <p>Establish EventDAO as the universal standard for verifiable event attendance. Scale to millions of events worldwide, with seamless integration across all major platforms and industries.</p>
          </div>
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