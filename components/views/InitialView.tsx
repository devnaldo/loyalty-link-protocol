import { InitialViewProps } from '../../types';

export const InitialView = ({ 
  handleCreateMint, 
  isLoading, 
  tokenName, 
  setTokenName, 
  savedMints, 
  openModal,
  isTransitioning 
}: InitialViewProps) => (
  <div className={`card-content ${isTransitioning ? 'page-transition-enter-active' : ''}`}>
    <h2>Powerful for Brands. Seamless for Users.</h2>
    <p>Launch a tokenized loyalty program on the world's most performant blockchain.</p>
    <div className="action-section">
      <input 
        type="text" 
        placeholder="Name Your Token (e.g. Coffee Points)" 
        className="input-field" 
        value={tokenName} 
        onChange={(e) => setTokenName(e.target.value)} 
      />
      <button onClick={handleCreateMint} disabled={isLoading || !tokenName} className="action-button">
        {isLoading ? "Creating..." : "🚀 Create Rewards Token"}
      </button>
      {savedMints.length > 0 && (
        <button onClick={openModal} className="secondary-button">
          🗂️ Manage Existing Tokens
        </button>
      )}
    </div>
  </div>
);