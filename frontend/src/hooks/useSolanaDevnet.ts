import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  getAccountBalance,
  requestAirdrop,
  sendSol,
  getTransactionHistory,
  getNetworkInfo,
  formatSolAmount,
  isValidSolanaAddress,
  SOLANA_CONFIG,
} from '../lib/solana-utils';
import { useWalletIntegration } from '../lib/wallet-integration';
import { SolanaAccountInfo, TransactionInfo } from '@eventdao/shared';

export const useSolanaDevnet = () => {
  const wallet = useWallet();
  const { user, isConnected, walletAddress } = useWalletIntegration();
  const [accountInfo, setAccountInfo] = useState<SolanaAccountInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [networkInfo, setNetworkInfo] = useState<{ cluster: string; endpoint: string; version?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh account balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.publicKey) {
      setAccountInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const balance = await getAccountBalance(wallet.publicKey);
      const formattedBalance = formatSolAmount(balance * 1000000000); // Convert SOL to lamports for formatting
      
      setAccountInfo({
        balance,
        formattedBalance,
        publicKey: wallet.publicKey.toString(),
        isDevnet: true, // Always true since we're using devnet
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      console.error('Error refreshing balance:', err);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  // Request airdrop (devnet only)
  const requestDevnetAirdrop = useCallback(async (amount: number = 1) => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const signature = await requestAirdrop(wallet.publicKey, amount);
      console.log('Airdrop successful:', signature);
      
      // Refresh balance after airdrop
      await refreshBalance();
      
      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request airdrop';
      setError(errorMessage);
      console.error('Error requesting airdrop:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, refreshBalance]);

  // Send SOL
  const sendSolTransaction = useCallback(async (recipient: string, amount: number) => {
    if (!isValidSolanaAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    try {
      setLoading(true);
      setError(null);
      
      const signature = await sendSol(wallet, recipient, amount);
      console.log('SOL sent successfully:', signature);
      
      // Refresh balance after transaction
      await refreshBalance();
      
      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send SOL';
      setError(errorMessage);
      console.error('Error sending SOL:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wallet, refreshBalance]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async (limit: number = 10) => {
    if (!wallet.publicKey) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txHistory = await getTransactionHistory(wallet.publicKey, limit);
      const formattedTransactions: TransactionInfo[] = txHistory.map(tx => ({
        signature: tx.signature,
        blockTime: tx.blockTime ?? null,
        slot: tx.slot,
        success: tx.transaction !== null,
      }));
      
      setTransactions(formattedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  // Fetch network info
  const fetchNetworkInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch network info');
      console.error('Error fetching network info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh balance when wallet connects
  useEffect(() => {
    if (isConnected && wallet.publicKey) {
      refreshBalance();
      fetchTransactions();
      fetchNetworkInfo();
    } else {
      setAccountInfo(null);
      setTransactions([]);
      setNetworkInfo(null);
    }
  }, [isConnected, wallet.publicKey, refreshBalance, fetchTransactions, fetchNetworkInfo]);

  // Periodic balance refresh (every 30 seconds when connected)
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, refreshBalance]);

  return {
    // Connection state
    isConnected,
    walletAddress,
    user,
    
    // Account info
    accountInfo,
    balance: accountInfo?.balance || 0,
    formattedBalance: accountInfo?.formattedBalance || '0.0000',
    
    // Network info
    networkInfo,
    isDevnet: true,
    networkConfig: SOLANA_CONFIG,
    
    // Transactions
    transactions,
    
    // Loading and error states
    loading,
    error,
    
    // Actions
    refreshBalance,
    requestDevnetAirdrop,
    sendSolTransaction,
    fetchTransactions,
    fetchNetworkInfo,
    
    // Utilities
    isValidSolanaAddress,
    formatSolAmount,
  };
};
