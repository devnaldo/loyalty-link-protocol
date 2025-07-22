import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
        <a href="https://github.com/your-username/loyalty-link-protocol" target="_blank" rel="noopener noreferrer" className="nav-link">Docs</a>
      </nav>
    </div>
    <div className="header-wallet">{isClient && <WalletMultiButton />}</div>
  </header>
);