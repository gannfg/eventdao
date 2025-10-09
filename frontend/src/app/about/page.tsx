import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header currentPage="about" />

      <div className={styles.container}>
        {/* Main Title */}
        <div className={styles.heroSection}>
          <div className={styles.logoContainer}>
            <Image
              src="/eventdao.png"
              alt="EventDAO - Proof of Event on Solana"
              width={800}
              height={400}
              className={styles.heroLogo}
              priority
            />
          </div>
          
          <div className={styles.quoteBox}>
            <p className={styles.quoteText}>
              Imagine a world where every concert, seminar, or sports match you attend can be verified on-chain. 
              No fake tickets. No unverifiable claims. Just transparent, collectible proof of attendance.
            </p>
          </div>
        </div>

        {/* Current Problems Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Problems</h2>
          <div className={styles.problemsBox}>
            <ul className={styles.problemsList}>
              <li>Events today are hard to verify</li>
              <li>Fake tickets, manual attendance, unverifiable claims.</li>
              <li>People want digital proof they can trust and collect</li>
            </ul>
          </div>
        </div>

        {/* EventDAO Solution Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>EventDAO Solution</h2>
          <div className={styles.solutionBox}>
            <p className={styles.solutionIntro}>
              EventDAO - A Solana-based platform for event verification
            </p>
            <ul className={styles.solutionList}>
              <li>Users submit event claims (e.g. &apos;Coldplay Jakarta, Nov 15, 2025, happened&apos;)</li>
              <li>Others stake small amounts (0.01-0.1 SOL) for or against</li>
              <li>Resolution via APIs, news feeds, or oracles</li>
              <li>Winners earn rewards</li>
              <li>Attendees mint unique NFT Proof of Attendance</li>
            </ul>
          </div>
        </div>

        {/* Key Features Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Event Verification Market</h3>
              <p className={styles.featureDescription}>
                Transparent and decentralized event verification marketplace
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>NFT Attendance (POAPs)</h3>
              <p className={styles.featureDescription}>
                Mint NFTs as collectible proof of attendance
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Gamification</h3>
              <p className={styles.featureDescription}>
                Leaderboards, badges, and engaging reward systems
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Community DAO</h3>
              <p className={styles.featureDescription}>
                Community DAO for event curation and moderation
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Benefits</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>Easy Verification</h3>
                <p className={styles.benefitDescription}>Via official APIs and trusted oracles</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>Global Use Case</h3>
                <p className={styles.benefitDescription}>Concerts, sports, conferences worldwide</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>Fun & Lightweight</h3>
                <p className={styles.benefitDescription}>Not political or bias-sensitive</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>Consumer-Friendly</h3>
                <p className={styles.benefitDescription}>NFTs as easy-to-use digital tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Solana Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Solana?</h2>
          <div className={styles.solanaGrid}>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Metaplex for NFTs</h3>
              <p className={styles.solanaDescription}>
                Well-integrated NFT standards
              </p>
            </div>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Pyth Oracles</h3>
              <p className={styles.solanaDescription}>
                Accurate real-time data verification
              </p>
            </div>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Solana Pay</h3>
              <p className={styles.solanaDescription}>
                Efficient payment system
              </p>
            </div>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Low Fees</h3>
              <p className={styles.solanaDescription}>
                Perfect for mass adoption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
