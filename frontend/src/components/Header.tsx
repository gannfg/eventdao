import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import ClientHeader from "./ClientHeader";

interface HeaderProps {
  currentPage?: string;
  className?: string;
}

export default function Header({ currentPage, className }: HeaderProps) {
  return <ClientHeader currentPage={currentPage} className={className} />;
}
