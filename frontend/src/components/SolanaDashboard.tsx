'use client';

import React, { useState } from 'react';
import { useSolanaDevnet } from '../hooks/useSolanaDevnet';
import WalletButton from './WalletButton';

const SolanaDashboard: React.FC = () => {
  const {
    isConnected,
    walletAddress,
    user,
    accountInfo,
    balance,
    formattedBalance,
    networkInfo,
    transactions,
    loading,
    error,
    refreshBalance,
    requestDevnetAirdrop,
    sendSolTransaction,
    fetchTransactions,
    fetchNetworkInfo,
    isValidSolanaAddress,
  } = useSolanaDevnet();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [airdropAmount, setAirdropAmount] = useState('1');
  const [sending, setSending] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  const handleSendSol = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientAddress || !sendAmount) {
      alert('Please fill in all fields');
      return;
    }

    if (!isValidSolanaAddress(recipientAddress)) {
      alert('Invalid recipient address');
      return;
    }

    const amount = parseFloat(sendAmount);
    if (amount <= 0 || amount > balance) {
      alert('Invalid amount');
      return;
    }

    try {
      setSending(true);
      const signature = await sendSolTransaction(recipientAddress, amount);
      alert(`SOL sent successfully! Signature: ${signature}`);
      setRecipientAddress('');
      setSendAmount('');
    } catch (err) {
      alert(`Failed to send SOL: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const handleAirdrop = async () => {
    const amount = parseFloat(airdropAmount);
    if (amount <= 0 || amount > 10) {
      alert('Airdrop amount must be between 0 and 10 SOL');
      return;
    }

    try {
      setAirdropping(true);
      const signature = await requestDevnetAirdrop(amount);
      alert(`Airdrop successful! Signature: ${signature}`);
    } catch (err) {
      alert(`Failed to request airdrop: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAirdropping(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Solana Devnet Dashboard</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to interact with Solana Devnet</p>
          <WalletButton className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Solana Devnet Dashboard</h1>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Connected to: <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">{walletAddress}</span></p>
            {user && <p className="text-gray-600">User: {user.username}</p>}
          </div>
          <WalletButton className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors" />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Balance</h2>
          <div className="text-3xl font-bold text-green-600 mb-2">{formattedBalance} SOL</div>
          <button
            onClick={refreshBalance}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Network Info</h2>
          {networkInfo ? (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Version:</span> {networkInfo.version}</p>
              <p><span className="font-medium">Slot:</span> {networkInfo.currentSlot.toLocaleString()}</p>
              <p><span className="font-medium">Epoch:</span> {networkInfo.epoch}</p>
              <p><span className="font-medium">Block Height:</span> {networkInfo.blockHeight.toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-gray-500">Loading network info...</p>
          )}
          <button
            onClick={fetchNetworkInfo}
            disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Network'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Devnet Airdrop</h2>
          <div className="space-y-3">
            <input
              type="number"
              value={airdropAmount}
              onChange={(e) => setAirdropAmount(e.target.value)}
              placeholder="Amount (1-10 SOL)"
              min="0.1"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAirdrop}
              disabled={airdropping || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {airdropping ? 'Requesting...' : 'Request Airdrop'}
            </button>
          </div>
        </div>
      </div>

      {/* Send SOL */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Send SOL</h2>
        <form onSubmit={handleSendSol} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter Solana address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              max={balance}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={sending || loading || !recipientAddress || !sendAmount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send SOL'}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <button
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                      >
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.blockTime 
                        ? new Date(tx.blockTime * 1000).toLocaleString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.slot.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions found</p>
        )}
      </div>
    </div>
  );
};

export default SolanaDashboard;
