import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  TransactionInstruction
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SolanaConfig, SolanaAccountInfo, TransactionInfo, NetworkInfo } from '@eventdao/shared';

// Devnet configuration
export const SOLANA_CONFIG: SolanaConfig = {
  network: 'devnet',
  rpcEndpoint: 'https://api.devnet.solana.com',
  wsEndpoint: 'wss://api.devnet.solana.com',
  commitment: 'confirmed',
};

// Create connection instance
export const getSolanaConnection = (): Connection => {
  return new Connection(SOLANA_CONFIG.rpcEndpoint, {
    commitment: SOLANA_CONFIG.commitment,
    wsEndpoint: SOLANA_CONFIG.wsEndpoint,
  });
};

// Get account balance in SOL
export const getAccountBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const connection = getSolanaConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
};

// Get account info
export const getAccountInfo = async (publicKey: PublicKey) => {
  try {
    const connection = getSolanaConnection();
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo;
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

// Request airdrop (for devnet testing)
export const requestAirdrop = async (publicKey: PublicKey, amount: number = 1): Promise<string> => {
  try {
    const connection = getSolanaConnection();
    const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw error;
  }
};

// Send SOL transaction
export const sendSol = async (
  wallet: WalletContextState,
  recipientAddress: string,
  amount: number
): Promise<string> => {
  try {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      throw new Error('Wallet not connected or sendTransaction not available');
    }

    const connection = getSolanaConnection();
    const recipient = new PublicKey(recipientAddress);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: wallet.publicKey,
    });

    // Add transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    transaction.add(transferInstruction);

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection);
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error sending SOL:', error);
    throw error;
  }
};

// Create a simple program instruction (placeholder for future program interactions)
export const createCustomInstruction = async (
  wallet: WalletContextState,
  programId: string,
  data: Buffer = Buffer.alloc(0)
): Promise<string> => {
  try {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      throw new Error('Wallet not connected or sendTransaction not available');
    }

    const connection = getSolanaConnection();
    const program = new PublicKey(programId);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: wallet.publicKey,
    });

    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      ],
      programId: program,
      data,
    });

    transaction.add(instruction);

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection);
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error creating custom instruction:', error);
    throw error;
  }
};

// Get transaction history (limited for devnet)
export const getTransactionHistory = async (publicKey: PublicKey, limit: number = 10) => {
  try {
    const connection = getSolanaConnection();
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            slot: sig.slot,
            transaction: tx,
          };
        } catch (error) {
          console.error(`Error fetching transaction ${sig.signature}:`, error);
          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            slot: sig.slot,
            transaction: null,
          };
        }
      })
    );
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

// Validate Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Format SOL amount
export const formatSolAmount = (lamports: number, decimals: number = 4): string => {
  const sol = lamports / LAMPORTS_PER_SOL;
  return sol.toFixed(decimals);
};

// Get network info
export const getNetworkInfo = async () => {
  try {
    const connection = getSolanaConnection();
    const [version, slot, blockHeight, epochInfo] = await Promise.all([
      connection.getVersion(),
      connection.getSlot(),
      connection.getBlockHeight(),
      connection.getEpochInfo(),
    ]);
    
    return {
      version: version['solana-core'],
      currentSlot: slot,
      blockHeight,
      epoch: epochInfo.epoch,
      slotIndex: epochInfo.slotIndex,
      slotsInEpoch: epochInfo.slotsInEpoch,
    };
  } catch (error) {
    console.error('Error fetching network info:', error);
    throw error;
  }
};
