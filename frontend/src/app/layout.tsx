import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "../components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventDAO — Proof of Event on Solana",
  description: "EventDAO lets you prove that real-world events truly happened — verified on Solana, rewarded with NFTs.",
  icons: {
    icon: [
      { url: '/eventdao_favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '16x16' }
    ],
    apple: '/eventdao_favicon.png',
    other: [
      { rel: 'icon', url: '/eventdao_favicon.png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
