'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleButtonClick = () => {
        if (connected) {
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            setVisible(true);
        }
    };

    const handleChangeWallet = () => {
        setIsDropdownOpen(false);
        setVisible(true);
    };

    const handleSignOut = () => {
        setIsDropdownOpen(false);
        disconnect();
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
        <div className="wallet-button-container" ref={dropdownRef}>
            <button
                onClick={handleButtonClick}
                className={className}
                disabled={connecting || userLoading}
                title={userError ? `Error: ${userError}` : connected && user ? `Connected as ${user.username}` : 'Connect your wallet'}
            >
                <span>{getButtonIcon()}</span>
                <span>{getButtonText()}</span>
                {connected && <span className="dropdown-arrow">▼</span>}
            </button>
            
            {isDropdownOpen && connected && (
                <div className="wallet-dropdown">
                    <button 
                        className="dropdown-item"
                        onClick={handleChangeWallet}
                    >
                        Change Wallet
                    </button>
                    <button 
                        className="dropdown-item"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletButton;
