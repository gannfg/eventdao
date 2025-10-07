'use client';

import React, { useState } from 'react';
import { useSolanaDevnet } from '../hooks/useSolanaDevnet';
import WalletButton from './WalletButton';

const SolanaTest: React.FC = () => {
  const {
    isConnected,
    walletAddress,
    balance,
    formattedBalance,
    networkInfo,
    loading,
    error,
    requestDevnetAirdrop,
    sendSolTransaction,
    isValidSolanaAddress,
  } = useSolanaDevnet();

  const [testRecipient, setTestRecipient] = useState('');
  const [testAmount, setTestAmount] = useState('0.01');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAirdrop = async () => {
    try {
      addTestResult('Requesting airdrop...');
      const signature = await requestDevnetAirdrop(0.1);
      addTestResult(`✅ Airdrop successful! Signature: ${signature.slice(0, 8)}...`);
    } catch (err) {
      addTestResult(`❌ Airdrop failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testSendSol = async () => {
    if (!testRecipient || !isValidSolanaAddress(testRecipient)) {
      addTestResult('❌ Invalid recipient address');
      return;
    }

    try {
      addTestResult(`Sending ${testAmount} SOL to ${testRecipient.slice(0, 8)}...`);
      const signature = await sendSolTransaction(testRecipient, parseFloat(testAmount));
      addTestResult(`✅ SOL sent successfully! Signature: ${signature.slice(0, 8)}...`);
    } catch (err) {
      addTestResult(`❌ Send failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testConnection = () => {
    if (isConnected) {
      addTestResult(`✅ Connected to wallet: ${walletAddress?.slice(0, 8)}...`);
      addTestResult(`✅ Balance: ${formattedBalance} SOL`);
      addTestResult(`✅ Network: Devnet`);
    } else {
      addTestResult('❌ Wallet not connected');
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Solana Integration Test</h3>
        <p className="text-gray-600 mb-4">Connect your wallet to test Solana devnet integration</p>
        <WalletButton className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Solana Integration Test</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Connection Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Connection Status</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Wallet:</span> {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}</p>
          <p><span className="font-medium">Balance:</span> {formattedBalance} SOL</p>
          <p><span className="font-medium">Network:</span> Devnet</p>
          {networkInfo && (
            <p><span className="font-medium">Slot:</span> {networkInfo.currentSlot.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={testConnection}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Test Connection
          </button>
          
          <button
            onClick={testAirdrop}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Test Airdrop (0.1 SOL)
          </button>
          
          <button
            onClick={() => setTestResults([])}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear Results
          </button>
        </div>

        {/* Send Test */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Recipient</label>
            <input
              type="text"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="Enter Solana address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (SOL)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max={balance}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={testSendSol}
            disabled={loading || !testRecipient || !testAmount}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Test Send SOL
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
        <h4 className="text-white font-medium mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Run some tests above!</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>

      {/* Quick Info */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-800 text-sm">
          <strong>Testing Tips:</strong> Use the airdrop function to get free SOL for testing. 
          You can send small amounts (0.01 SOL) to test the send functionality. 
          All transactions are on Solana Devnet.
        </p>
      </div>
    </div>
  );
};

export default SolanaTest;