"use client";

import dynamic from "next/dynamic";

// Dynamic import for wallet provider to reduce initial bundle size
const WalletContextProvider = dynamic(
  () => import("./WalletProvider"),
  { 
    ssr: false,
    loading: () => <div style={{ minHeight: "100vh" }} /> 
  }
);

export default WalletContextProvider;
