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
              alt="EventDAO - Truth Verification Through Collective Intelligence"
              width={800}
              height={400}
              className={styles.heroLogo}
              priority
            />
          </div>
          
          <div className={styles.quoteBox}>
            <p className={styles.quoteText}>
              Imagine a world where truth is verified through collective intelligence, not centralized control. 
              No fake news. No unverifiable claims. Just transparent, community-driven truth verification.
            </p>
          </div>
        </div>

        {/* Current Problems Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Problems</h2>
          <div className={styles.problemsBox}>
            <ul className={styles.problemsList}>
              <li>Misinformation spreads faster than truth verification</li>
              <li>Centralized fact-checkers are slow, biased, or untrusted</li>
              <li>People need a decentralized way to verify news and events collectively</li>
            </ul>
          </div>
        </div>

        {/* EventDAO Solution Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>EventDAO Solution</h2>
          <div className={styles.solutionBox}>
            <p className={styles.solutionIntro}>
              EventDAO - A Solana-based platform for truth verification through collective intelligence
            </p>
            <ul className={styles.solutionList}>
              <li>Users submit truth claims (e.g. &apos;Tesla announces Gigafactory in Vietnam&apos;)</li>
              <li>Community stakes tokens to express judgment on Fact vs Hoax</li>
              <li>AI monitors credible sources (BBC, CNN, Reuters) via NewsData.io</li>
              <li>7-day resolution period with automatic verification</li>
              <li>Correct stakers earn redistributed tokens and reputation points</li>
            </ul>
          </div>
        </div>

        {/* Key Features Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>AI-Powered Verification</h3>
              <p className={styles.featureDescription}>
                Automatically analyze claims using NewsData.io to detect related coverage and credible sources
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Collective Intelligence</h3>
              <p className={styles.featureDescription}>
                Community stakes tokens to express judgment on Fact vs Hoax, creating balanced truth-seeking ecosystem
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Reputation System</h3>
              <p className={styles.featureDescription}>
                Earn reputation points for accuracy, with higher reputation increasing future rewards and credibility
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>7-Day Resolution</h3>
              <p className={styles.featureDescription}>
                Time-bound verification with automatic monitoring of credible sources like BBC, CNN, Reuters
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
                <h3 className={styles.benefitTitle}>Decentralized Truth</h3>
                <p className={styles.benefitDescription}>No single entity controls truth verification</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>Global Application</h3>
                <p className={styles.benefitDescription}>Product launches, sports, news, events worldwide</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>Incentivized Accuracy</h3>
                <p className={styles.benefitDescription}>Reward truth-seekers, penalize misinformation</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.checkmarkIcon}>✓</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>AI-Enhanced</h3>
                <p className={styles.benefitDescription}>Automated monitoring of credible news sources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Solana Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Solana?</h2>
          <div className={styles.solanaGrid}>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Fast Transactions</h3>
              <p className={styles.solanaDescription}>
                Real-time truth verification and token redistribution
              </p>
            </div>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Low Fees</h3>
              <p className={styles.solanaDescription}>
                Perfect for frequent staking and collective intelligence
              </p>
            </div>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Scalable Infrastructure</h3>
              <p className={styles.solanaDescription}>
                Handle mass participation in truth verification
              </p>
            </div>
            <div className={styles.solanaCard}>
              <h3 className={styles.solanaTitle}>Transparent Blockchain</h3>
              <p className={styles.solanaDescription}>
                Immutable record of all truth verification activities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
