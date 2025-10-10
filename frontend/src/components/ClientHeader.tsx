"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./Header.module.css";
import { isAdminEnabled } from "../utils/environment";

// Dynamic imports for wallet-related components
const WalletButton = dynamic(() => import("./WalletButton"), {
  ssr: false,
  loading: () => <div style={{ width: "120px", height: "40px" }} />
});

const WelcomeMessage = dynamic(() => import("./WelcomeMessage"), {
  ssr: false,
  loading: () => <div style={{ width: "100px", height: "20px" }} />
});

const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
  loading: () => <div style={{ width: "40px", height: "40px" }} />
});

interface HeaderProps {
  currentPage?: string;
  className?: string;
}

export default function ClientHeader({ currentPage, className }: HeaderProps) {
  const getActiveClass = (pageName: string) => {
    return currentPage === pageName ? styles.active : '';
  };

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.brand}>
        <Image
          src="/eventdao_letter.png"
          alt="EventDAO Logo"
          width={160}
          height={53}
          className={styles.brandLogo}
          priority
          sizes="(max-width: 768px) 120px, 160px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <span className={styles.brandSubtitle}>Solana Web3 Events</span>
      </div>
      <MobileMenu />
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navLink} ${getActiveClass('home')}`}>Home</Link>
        <a href="/submit" className={`${styles.navLink} ${getActiveClass('submit')}`}>Submit</a>
        <a href="/explore" className={`${styles.navLink} ${getActiveClass('explore')}`}>Explore</a>
        <a href="/leaderboard" className={`${styles.navLink} ${getActiveClass('leaderboard')}`}>Leaderboard</a>
        <a href="/wallet" className={`${styles.navLink} ${getActiveClass('wallet')}`}>Wallet</a>
        {isAdminEnabled() && (
          <a href="/admin" className={`${styles.navLink} ${getActiveClass('admin')}`}>Admin</a>
        )}
        <a href="/about" className={`${styles.navLink} ${getActiveClass('about')}`}>About</a>
      </nav>
      <div className={styles.actions}>
        <WelcomeMessage className={styles.welcomeMessage} />
        <WalletButton className={styles.walletBtn} />
      </div>
    </header>
  );
}
