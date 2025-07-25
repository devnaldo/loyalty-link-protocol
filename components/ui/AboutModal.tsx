import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About LoyaltyLink Protocol</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="about-content">
          {/* Hero Section */}
          <div className="about-hero">
            <div className="hero-gradient-text">
              A Unified Ledger for Customer Loyalty on Solana
            </div>
            <p className="hero-subtitle">
              Transform fragmented loyalty points into liquid, programmable assets that customers truly own and control.
            </p>
          </div>

          {/* Problem Section */}
          <div className="about-section">
            <h3 className="section-title">The Problem We Solve</h3>
            <div className="problem-grid">
              <div className="problem-card">
                <div className="problem-icon">💳</div>
                <h4>For Consumers</h4>
                <ul>
                  <li>Loyalty points trapped in isolated systems</li>
                  <li>Unusable small balances across multiple platforms</li>
                  <li>Points expire worthless with no liquidity</li>
                  <li>No way to combine rewards from different merchants</li>
                </ul>
              </div>
              <div className="problem-card">
                <div className="problem-icon">🏪</div>
                <h4>For Merchants</h4>
                <ul>
                  <li>Expensive loyalty programs with poor retention</li>
                  <li>Limited reach outside immediate ecosystem</li>
                  <li>No partnership opportunities with other businesses</li>
                  <li>Walled garden preventing cross-promotion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div className="about-section">
            <h3 className="section-title">Our Solution</h3>
            <div className="solution-features">
              <div className="feature-item">
                <div className="feature-icon">🔗</div>
                <div className="feature-content">
                  <h4>Unified Loyalty Wallet</h4>
                  <p>All your loyalty points from participating merchants live in your single crypto wallet. View your entire loyalty portfolio in one place.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🔄</div>
                <div className="feature-content">
                  <h4>Liquid Point Trading</h4>
                  <p>Swap BookstorePoints for CafePoints, or pool them together to redeem larger rewards in our universal marketplace.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-content">
                  <h4>5-Minute Setup</h4>
                  <p>Merchants can create their own branded loyalty token in under 5 minutes using our self-serve portal.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🤝</div>
                <div className="feature-content">
                  <h4>Cross-Merchant Partnerships</h4>
                  <p>Enable seamless joint campaigns between businesses. A bookstore can offer coffee discounts programmatically.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="about-section">
            <h3 className="section-title">Platform Benefits</h3>
            <div className="benefits-grid">
              <div className="benefit-card customer">
                <h4>For Customers</h4>
                <div className="benefit-list">
                  <span className="benefit-point">✨ True ownership of loyalty assets</span>
                  <span className="benefit-point">🔄 Trade points between merchants</span>
                  <span className="benefit-point">📱 Single wallet for all rewards</span>
                  <span className="benefit-point">💎 No more expiring points</span>
                  <span className="benefit-point">🎯 Discover new businesses through point swaps</span>
                </div>
              </div>
              
              <div className="benefit-card merchant">
                <h4>For Merchants</h4>
                <div className="benefit-list">
                  <span className="benefit-point">🚀 Acquire customers from other merchants</span>
                  <span className="benefit-point">💰 Near-zero setup costs</span>
                  <span className="benefit-point">🔗 Easy cross-promotional partnerships</span>
                  <span className="benefit-point">📊 Enhanced customer engagement</span>
                  <span className="benefit-point">🌐 Web3-native customer channel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Section */}
          <div className="about-section">
            <h3 className="section-title">Built on Solana</h3>
            <div className="tech-highlights">
              <div className="tech-item">
                <div className="tech-stat">65,000+</div>
                <div className="tech-label">Transactions per second</div>
              </div>
              <div className="tech-item">
                <div className="tech-stat">&lt;1s</div>
                <div className="tech-label">Transaction finality</div>
              </div>
              <div className="tech-item">
                <div className="tech-stat">$0.00025</div>
                <div className="tech-label">Average transaction cost</div>
              </div>
            </div>
            <p className="tech-description">
              Leveraging Solana's high throughput and low fees to handle the high volume of micro-transactions that a successful loyalty ecosystem requires.
            </p>
          </div>

          {/* Vision Section */}
          <div className="about-section vision-section">
            <h3 className="section-title">Our Vision</h3>
            <div className="vision-content">
              <p>
                We envision a world where customer loyalty is no longer trapped in silos. 
                LoyaltyLink creates a seamless network where value flows freely, transforming 
                dead loyalty points into liquid assets that benefit both consumers and merchants.
              </p>
              <div className="vision-cta">
                <strong>Join us in revolutionizing customer loyalty on the blockchain.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};