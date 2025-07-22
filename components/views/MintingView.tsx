import { MintingViewProps } from '../../types';

export const MintingView = ({ 
  activeMint, 
  createTxSignature, 
  recipientAddress, 
  setRecipientAddress, 
  mintQuantity, 
  setMintQuantity, 
  handleMintPoints, 
  isLoading, 
  mintTxSignature, 
  handleGoToInitialView, 
  openModal,
  isTransitioning 
}: MintingViewProps) => (
  <div className={`card-content ${isTransitioning ? 'page-transition-enter-active' : ''}`}>
    <div className="success-message">
      <p>✅ Program Loaded: <strong>{activeMint?.name}</strong></p>
      <p><strong>Token Address:</strong></p>
      <p className="address-text">{activeMint?.address}</p>
      {createTxSignature && <p><strong>Creation Tx:</strong> <a href={`https://explorer.solana.com/tx/${createTxSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>}
    </div>
    <div className="minting-section">
      <h3>Distribute Rewards</h3>
      <input 
        type="text" 
        placeholder="Recipient's Solana Address" 
        className="input-field" 
        value={recipientAddress} 
        onChange={(e) => setRecipientAddress(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Quantity" 
        className="input-field" 
        value={mintQuantity} 
        onChange={(e) => setMintQuantity(Number(e.target.value))} 
      />
      <button onClick={handleMintPoints} disabled={isLoading || !recipientAddress || mintQuantity <= 0} className="action-button">
        {isLoading ? "Sending..." : "✨ Mint & Send Tokens"}
      </button>
      {mintTxSignature && (
        <div className="success-message">
            <p>✅ Tokens Sent!</p>
            <p><strong>Transaction:</strong> <a href={`https://explorer.solana.com/tx/${mintTxSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>
        </div>
      )}
      <button onClick={handleGoToInitialView} className="action-button" style={{ marginTop: '1.5rem' }}>🚀 Create a New Token</button>
      <button onClick={openModal} className="secondary-button">🗂️ Select a Different Token</button>
    </div>
  </div>
);