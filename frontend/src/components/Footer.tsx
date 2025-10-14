'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Content */}
      <div className={styles.footerOverlay}>
        <div className={styles.footerContainer}>
          {/* Left side - Branding */}
          <div className={styles.branding}>
          <div className={styles.logoContainer}>
            <Image
              src="/eventdao_little.png"
              alt="EventDAO Logo"
              width={120}
              height={40}
              className={styles.logo}
              priority
            />
          </div>
            <div className={styles.brandText}>
              <p className={styles.brandLine}>Built on Solana</p>
              <p className={styles.brandLine}>Powered by Community</p>
            </div>
          </div>

          {/* Right side - Social Links */}
          <div className={styles.socialLinks}>
            <Link href="https://x.com/Event_DAO" className={styles.socialLink} aria-label="Follow us on X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25H21.168L13.583 10.885L22.5 21.75H15.416L9.916 14.885L3.666 21.75H0.741L8.916 12.615L0.5 2.25H7.833L12.666 8.385L18.244 2.25ZM16.583 19.5H18.416L6.416 4.5H4.416L16.583 19.5Z" fill="currentColor"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
