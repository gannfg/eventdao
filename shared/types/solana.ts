// Shared Solana types for both frontend and backend

export interface SolanaConfig {
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcEndpoint: string;
  wsEndpoint: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}

export interface SolanaAccountInfo {
  balance: number;
  formattedBalance: string;
  publicKey: string;
  isDevnet: boolean;
}

export interface TransactionInfo {
  signature: string;
  blockTime: number | null;
  slot: number;
  success: boolean;
}

export interface NetworkInfo {
  version: string;
  currentSlot: number;
  blockHeight: number;
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
}

// Wallet integration types
export interface WalletUser {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  reputation: number;
  total_staked: number;
  total_verified: number;
  created_at: string;
  updated_at: string;
}

// Solana program types
export interface ProgramAccount {
  publicKey: string;
  account: {
    data: Buffer;
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
}

export interface ProgramInstruction {
  programId: string;
  keys: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: Buffer;
}
