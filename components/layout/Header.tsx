import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaGithub } from 'react-icons/fa';
import { HeaderProps } from '../../types';

export const Header = ({ isClient, handleLogoClick }: HeaderProps) => (
  <header className="header">
    <div className="header-left">
      <div className="header-logo" onClick={handleLogoClick}>
        <h1>SolRewards</h1>
      </div>
      <nav className="nav-links">
        <a href="#" className="nav-link">About</a>
        <a href="#" className="nav-link">How it Works</a>
        <a href="https://github.com/devnaldo/loyalty-link-protocol/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="nav-link">Docs</a>
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
    <div className="header-wallet">{isClient && <WalletMultiButton />}</div>
  </header>
);