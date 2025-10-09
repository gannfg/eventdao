import Image from "next/image";
import Link from "next/link";
import WalletButton from "./WalletButton";
import WelcomeMessage from "./WelcomeMessage";
import MobileMenu from "./MobileMenu";
import styles from "./Header.module.css";

interface HeaderProps {
  currentPage?: string;
  className?: string;
}

export default function Header({ currentPage, className }: HeaderProps) {
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
        <a href="/admin" className={`${styles.navLink} ${getActiveClass('admin')}`}>Admin</a>
        <a href="/about" className={`${styles.navLink} ${getActiveClass('about')}`}>About</a>
      </nav>
      <div className={styles.actions}>
        <WelcomeMessage className={styles.welcomeMessage} />
        <WalletButton className={styles.walletBtn} />
      </div>
    </header>
  );
}
