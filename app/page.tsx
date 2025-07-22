"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { web3 } from "@coral-xyz/anchor";
import { Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import sha256 from "js-sha256";

// The address of our deployed LoyaltyLink Protocol program.
const programId = new web3.PublicKey("8V6oDMwNGK694Gw9VpDaLtVpjpeqDoWG5Bci1vhygPCw");

interface SavedMint {
  address: string;
  name: string;
  createdAt: string;
}

// --- Component Definitions (Moved outside of Home for performance) ---

const InitialView = ({ handleCreateMint, isLoading, tokenName, setTokenName, savedMints, openModal }) => (
  <>
    <h2>Launch Your Tokenized Loyalty Program</h2>
    <p>Create a unique rewards token for your brand on Solana, powered by the LoyaltyLink Protocol.</p>
    <div className="action-section">
      <input 
        type="text" 
        placeholder="Name Your Token (e.g. Coffee Points)" 
        className="input-field" 
        value={tokenName} 
        onChange={(e) => setTokenName(e.target.value)} 
      />
      <button onClick={handleCreateMint} disabled={isLoading || !tokenName} className="action-button" style={{ marginTop: '1rem' }}>
        {isLoading ? "Creating..." : "🚀 Create New Rewards Token"}
      </button>
      {savedMints.length > 0 && (
        <button onClick={openModal} className="secondary-button">
          🗂️ Use an Existing Token
        </button>
      )}
    </div>
  </>
);

const MintingView = ({ activeMint, createTxSignature, recipientAddress, setRecipientAddress, mintQuantity, setMintQuantity, handleMintPoints, isLoading, mintTxSignature, handleGoToInitialView, openModal }) => (
  <>
    <div className="success-message">
      <p>✅ Program Loaded: <strong>{activeMint?.name}</strong></p>
      <p><strong>Active Rewards Token Address:</strong></p>
      <p className="address-text">{activeMint?.address}</p>
      {createTxSignature && <p><strong>Creation Transaction:</strong> <a href={`https://explorer.solana.com/tx/${createTxSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>}
    </div>
    <div className="minting-section">
      <h3>Mint & Distribute Points</h3>
      <input type="text" placeholder="Recipient's Solana Address" className="input-field" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
      <input type="number" placeholder="Quantity" className="input-field" value={mintQuantity} onChange={(e) => setMintQuantity(Number(e.target.value))} />
      <button onClick={handleMintPoints} disabled={isLoading || !recipientAddress || mintQuantity <= 0} className="action-button">
        {isLoading ? "Minting..." : "✨ Mint & Send Points"}
      </button>
      {mintTxSignature && (
        <div className="success-message">
            <p>✅ Points Sent!</p>
            <p><strong>Transaction:</strong> <a href={`https://explorer.solana.com/tx/${mintTxSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>
        </div>
      )}
      <button onClick={handleGoToInitialView} className="action-button" style={{ marginTop: '1.5rem' }}>🚀 Create Another Token</button>
      <button onClick={openModal} className="secondary-button">🗂️ Select a Different Token</button>
    </div>
  </>
);

const ProgramsModal = ({ savedMints, handleSelectMint, closeModal }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Select an Existing Token</h2>
        <button onClick={closeModal} className="modal-close-button">&times;</button>
      </div>
      <ul className="program-list">
        {savedMints.map((mint) => (
          <li key={mint.address} onClick={() => handleSelectMint(mint)} className="program-list-item">
            <p className="address-label">{mint.name}</p>
            <p className="address-text">{mint.address}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeMint, setActiveMint] = useState<SavedMint | null>(null);
  const [savedMints, setSavedMints] = useState<SavedMint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [tokenName, setTokenName] = useState('');
  const [createTxSignature, setCreateTxSignature] = useState<string | null>(null);
  const [mintTxSignature, setMintTxSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [mintQuantity, setMintQuantity] = useState(100);

  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    setIsClient(true);
    const loadedMints = JSON.parse(localStorage.getItem("solrewards-mints") || "[]");
    setSavedMints(loadedMints);
  }, []);

  const handleCreateMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return alert("Please connect your wallet!");
    if (!tokenName) return alert("Please enter a name for your token!");
    setIsLoading(true);

    try {
      const newMint = web3.Keypair.generate();
      const instructionName = "create_loyalty_mint";
      const discriminator = Buffer.from(sha256.digest(`global:${instructionName}`)).slice(0, 8);
      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: newMint.publicKey, isSigner: true, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: discriminator,
      });
      const latestBlockhash = await connection.getLatestBlockhash('finalized');
      const transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: latestBlockhash.blockhash }).add(instruction);
      transaction.partialSign(newMint);
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction({ ...latestBlockhash, signature }, 'processed');
      
      const newMintAddress = newMint.publicKey.toBase58();
      const newMintData = { address: newMintAddress, name: tokenName, createdAt: new Date().toISOString() };
      const updatedMints = [...savedMints, newMintData];
      setSavedMints(updatedMints);
      localStorage.setItem("solrewards-mints", JSON.stringify(updatedMints));

      setActiveMint(newMintData);
      setCreateTxSignature(signature);
    } catch (error) {
      console.error("Error creating mint:", error);
      alert("Failed to create loyalty program. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintPoints = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !activeMint) return alert("Program not selected or wallet not connected!");
    setIsLoading(true);
    setMintTxSignature(null);

    try {
        const recipient = new web3.PublicKey(recipientAddress);
        const mint = new web3.PublicKey(activeMint.address);
        const associatedTokenAccount = await getAssociatedTokenAddress(mint, recipient);
        const instructions: TransactionInstruction[] = [];
        
        const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
        if (!accountInfo) {
            instructions.push(
                createAssociatedTokenAccountInstruction(wallet.publicKey, associatedTokenAccount, recipient, mint)
            );
        }
        
        const instructionName = "mint_loyalty_points";
        const discriminator = Buffer.from(sha256.digest(`global:${instructionName}`)).slice(0, 8);
        const quantityBuffer = Buffer.alloc(8);
        quantityBuffer.writeBigUInt64LE(BigInt(mintQuantity));

        instructions.push(new web3.TransactionInstruction({
            keys: [
                { pubkey: mint, isSigner: false, isWritable: true },
                { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
                { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            ],
            programId,
            data: Buffer.concat([discriminator, quantityBuffer]),
        }));

        const latestBlockhash = await connection.getLatestBlockhash('finalized');
        const transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: latestBlockhash.blockhash }).add(...instructions);
        
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction({ ...latestBlockhash, signature }, 'processed');
        
        setMintTxSignature(signature);
    } catch (error) {
        console.error("Error minting points:", error);
        alert("Failed to mint points. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMint = (mint: SavedMint) => {
    setActiveMint(mint);
    setIsModalOpen(false);
    setCreateTxSignature(null);
    setMintTxSignature(null);
  };

  const handleGoToInitialView = () => {
    setActiveMint(null);
    setCreateTxSignature(null);
    setMintTxSignature(null);
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-logo"><h1>SolRewards</h1></div>
        <div className="header-wallet">{isClient && <WalletMultiButton />}</div>
      </header>
      <main className="main-content">
        <div className="card">
          {wallet.publicKey ? (
            activeMint ? 
            <MintingView 
              activeMint={activeMint}
              createTxSignature={createTxSignature}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              mintQuantity={mintQuantity}
              setMintQuantity={setMintQuantity}
              handleMintPoints={handleMintPoints}
              isLoading={isLoading}
              mintTxSignature={mintTxSignature}
              handleGoToInitialView={handleGoToInitialView}
              openModal={() => setIsModalOpen(true)}
            /> : 
            <InitialView 
              handleCreateMint={handleCreateMint}
              isLoading={isLoading}
              tokenName={tokenName}
              setTokenName={setTokenName}
              savedMints={savedMints}
              openModal={() => setIsModalOpen(true)}
            />
          ) : (
            <>
              <h2>Welcome to SolRewards</h2>
              <p className="connect-prompt">Please connect your wallet to begin.</p>
            </>
          )}
        </div>
        {isClient && isModalOpen && 
          <ProgramsModal 
            savedMints={savedMints}
            handleSelectMint={handleSelectMint}
            closeModal={() => setIsModalOpen(false)}
          />
        }
      </main>
    </div>
  );
}
