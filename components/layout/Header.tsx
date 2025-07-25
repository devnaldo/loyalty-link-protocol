import { useState } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaGithub } from 'react-icons/fa';
import { HeaderProps } from '../../types';
import { AboutModal } from '../ui/AboutModal';

export const Header = ({ isClient, handleLogoClick }: HeaderProps) => {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAboutModalOpen(true);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="header-logo" onClick={handleLogoClick}>
            <h1>SolRewards</h1>
          </div>
          <nav className="nav-links">
            <button 
              onClick={handleAboutClick}
              className="nav-link nav-button"
            >
              About
            </button>
            <a href="#" className="nav-link">How it Works</a>
            <a 
              href="https://github.com/devnaldo/loyalty-link-protocol/blob/main/README.md" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-link"
            >
              Docs
            </a>
            <a 
              href="https://github.com/devnaldo/loyalty-link-protocol" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-link github-button"
            >
              <FaGithub className="github-icon" />
              GitHub
            </a>
          </nav>
        </div>
        <div className="header-wallet">
          {isClient && <WalletMultiButton />}
        </div>
      </header>

      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
    </>
  );
};