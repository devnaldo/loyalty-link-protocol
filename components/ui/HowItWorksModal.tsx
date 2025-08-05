"use client";

import React from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ensure this component is exported correctly.
export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How It Works: Welcome to the Devnet!</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="about-content">
          {/* Hero Section */}
          <div className="about-hero">
            <div className="hero-gradient-text">
              Ready for the Big Stage, Perfected on Devnet
            </div>
            <p className="hero-subtitle">
              We're currently operating on the Solana Devnet to ensure everything is flawless for our mainnet launch. To use the platform, you'll need to use the test environment. Here’s how to get started.
            </p>
          </div>

          {/* Steps Section */}
          <div className="about-section">
            <h3 className="section-title">Get Started in 3 Simple Steps</h3>
            <div className="solution-features">
              
              <div className="feature-item">
                <div className="feature-icon">🌐</div>
                <div className="feature-content">
                  <h4>1. Switch Your Wallet to Devnet</h4>
                  <p>Open your Solana wallet (e.g., Phantom or Solflare), go to Settings &gt; Developer Settings &gt; Network, and select 'Devnet'. This is a test network, so you won't be using any real funds.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">💧</div>
                <div className="feature-content">
                  <h4>2. Get Free Devnet SOL</h4>
                  <p>To pay for transaction fees on the testnet, you'll need some devnet SOL. You can get this for free from a Solana faucet. A popular one is <a href="https://solfaucet.com/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--solana-green)'}}>solfaucet.com</a>.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <div className="feature-content">
                  <h4>3. Create & Mint Your Tokens</h4>
                  <p>Once your wallet is on Devnet and funded with test SOL, you're all set! You can now create, mint, and send tokens on our platform just as you would on the mainnet.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Vision Section */}
          <div className="about-section vision-section">
            <h3 className="section-title">You're Helping Us Build the Future</h3>
            <div className="vision-content">
              <p>
                By using SolRewards on the devnet, you're playing a crucial role in our final testing phase. Your activity helps us ensure a secure, stable, and seamless launch on the mainnet.
              </p>
              <div className="vision-cta">
                <strong>Thank you for being a vital part of our journey!</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
