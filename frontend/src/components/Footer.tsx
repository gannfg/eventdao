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
            <Link href="/docs" className={styles.socialLink} aria-label="Documentation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            
            <Link href="https://twitter.com/eventdao" className={styles.socialLink} aria-label="Follow us on X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25H21.168L13.583 10.885L22.5 21.75H15.416L9.916 14.885L3.666 21.75H0.741L8.916 12.615L0.5 2.25H7.833L12.666 8.385L18.244 2.25ZM16.583 19.5H18.416L6.416 4.5H4.416L16.583 19.5Z" fill="currentColor"/>
              </svg>
            </Link>
            
            <Link href="https://discord.gg/eventdao" className={styles.socialLink} aria-label="Join our Discord" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37C18.352 3.119 16.256 2.25 14.1 1.75C13.9 1.69 13.7 1.75 13.6 1.9C13.3 2.3 13 2.8 12.8 3.2C10.8 2.9 8.8 2.9 6.9 3.2C6.7 2.8 6.4 2.3 6.1 1.9C6 1.75 5.8 1.69 5.6 1.75C3.4 2.25 1.3 3.119 -0.7 4.37C-0.7 4.37 -1.1 6.2 -1.1 8C-1.1 9.8 -0.7 11.6 -0.7 11.6C1.3 12.9 3.4 13.8 5.6 14.3C5.8 14.4 6 14.2 6.1 14C6.4 13.6 6.7 13.1 6.9 12.7C7.1 12.5 7.3 12.2 7.4 11.9C5.2 11.3 3.2 10.2 1.8 8.8C1.6 8.6 1.6 8.2 1.8 8C2 7.8 2.4 7.8 2.6 8C3.7 9.1 5 9.9 6.4 10.4C6.6 10.5 6.8 10.5 7 10.4C9.4 9.9 11.7 8.5 13.5 6.4C13.7 6.2 14.1 6.2 14.3 6.4C16.1 8.5 18.4 9.9 20.8 10.4C21 10.5 21.2 10.5 21.4 10.4C22.8 9.9 24.1 9.1 25.2 8C25.4 7.8 25.8 7.8 26 8C26.2 8.2 26.2 8.6 26 8.8C24.6 10.2 22.6 11.3 20.4 11.9C20.5 12.2 20.7 12.5 20.9 12.7C21.1 13.1 21.4 13.6 21.7 14C21.8 14.2 22 14.4 22.2 14.3C24.4 13.8 26.5 12.9 28.5 11.6C28.5 11.6 28.1 9.8 28.1 8C28.1 6.2 28.5 4.37 28.5 4.37C26.5 3.119 24.4 2.25 22.2 1.75C22 1.69 21.8 1.75 21.7 1.9C21.4 2.3 21.1 2.8 20.9 3.2C19 2.9 17 2.9 15.1 3.2C14.9 2.8 14.6 2.3 14.3 1.9C14.2 1.75 14 1.69 13.8 1.75C11.6 2.25 9.5 3.119 7.5 4.37C7.5 4.37 7.1 6.2 7.1 8C7.1 9.8 7.5 11.6 7.5 11.6C9.5 12.9 11.6 13.8 13.8 14.3C14 14.4 14.2 14.2 14.3 14C14.6 13.6 14.9 13.1 15.1 12.7C15.3 12.5 15.5 12.2 15.6 11.9C13.4 11.3 11.4 10.2 10 8.8C9.8 8.6 9.8 8.2 10 8C10.2 7.8 10.6 7.8 10.8 8C11.9 9.1 13.2 9.9 14.6 10.4C14.8 10.5 15 10.5 15.2 10.4C17.6 9.9 19.9 8.5 21.7 6.4C21.9 6.2 22.3 6.2 22.5 6.4C24.3 8.5 26.6 9.9 29 10.4C29.2 10.5 29.4 10.5 29.6 10.4C31 9.9 32.3 9.1 33.4 8C33.6 7.8 34 7.8 34.2 8C34.4 8.2 34.4 8.6 34.2 8.8C32.8 10.2 30.8 11.3 28.6 11.9C28.7 12.2 28.9 12.5 29.1 12.7C29.3 13.1 29.6 13.6 29.9 14C30 14.2 30.2 14.4 30.4 14.3C32.6 13.8 34.7 12.9 36.7 11.6C36.7 11.6 36.3 9.8 36.3 8C36.3 6.2 36.7 4.37 36.7 4.37Z" fill="currentColor"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
