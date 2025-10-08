'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletIntegration } from '../lib/wallet-integration';

interface WalletButtonProps {
    className?: string;
}

const WalletButton: React.FC<WalletButtonProps> = ({ className }) => {
    const { wallet, connecting, connected, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const { 
        user, 
        loading: userLoading, 
        error: userError
    } = useWalletIntegration();

    const handleClick = () => {
        if (connected) {
            disconnect();
        } else {
            setVisible(true);
        }
    };

    const getButtonText = () => {
        if (connecting || userLoading) return 'Connecting...';
        if (connected && wallet && user) {
            const address = wallet.adapter.publicKey?.toString();
            return address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connected';
        }
        if (connected && !user && !userLoading) {
            return 'Setting up...';
        }
        return 'Connect Wallet';
    };

    const getButtonIcon = () => {
        if (connected && user) return '👻';
        if (connecting || userLoading) return '⏳';
        return '🔗';
    };

    return (
        <button
            onClick={handleClick}
            className={className}
            disabled={connecting || userLoading}
            title={userError ? `Error: ${userError}` : connected && user ? `Connected as ${user.username}` : 'Connect your wallet'}
        >
            <span>{getButtonIcon()}</span>
            <span>{getButtonText()}</span>
        </button>
    );
};

export default WalletButton;
