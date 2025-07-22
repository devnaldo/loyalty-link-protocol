import { ViewProps } from '../../types';

export const WelcomeView = ({ isTransitioning }: ViewProps) => (
  <div className={`card-content ${isTransitioning ? 'page-transition-enter-active' : ''}`}>
    <h2>Welcome to SolRewards</h2>
    <p className="connect-prompt">The open protocol for tokenized loyalty on Solana.</p>
  </div>
);