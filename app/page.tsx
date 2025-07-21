"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { web3 } from "@coral-xyz/anchor";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import sha256 from "js-sha256";

// The address of our deployed program.
const programId = new web3.PublicKey("8V6oDMwNGK694Gw9VpDaLtVpjpeqDoWG5Bci1vhygPCw");

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet!");
      return;
    }

    setIsLoading(true);
    setMintAddress(null);
    setTxSignature(null);

    try {
      const newMint = web3.Keypair.generate();

      // Manually build the instruction to bypass the buggy Anchor library functions.
      const instructionName = "create_loyalty_mint";
      const discriminator = Buffer.from(sha256.digest(`global:${instructionName}`)).slice(0, 8);

      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: newMint.publicKey, isSigner: true, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: programId,
        data: discriminator, 
      });
      
      const latestBlockhash = await connection.getLatestBlockhash('finalized');
      
      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(instruction);
      
      transaction.partialSign(newMint);

      const signedTransaction = await wallet.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: signature,
      }, 'processed');

      setMintAddress(newMint.publicKey.toBase58());
      setTxSignature(signature);

    } catch (error) {
      console.error("Error creating mint:", error);
      alert("Failed to create loyalty program. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-logo">
          <h1>LoyaltyLink</h1>
        </div>
        <div className="header-wallet">
          {isClient && <WalletMultiButton />}
        </div>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Merchant Portal</h2>
          <p>Create and manage your loyalty program on Solana.</p>

          {wallet.publicKey ? (
            <div className="action-section">
              <button 
                onClick={handleCreateMint} 
                disabled={isLoading}
                className="action-button"
              >
                {isLoading ? "Creating..." : "🚀 Create New Loyalty Program"}
              </button>
              {mintAddress && (
                <div className="success-message">
                  <p>✅ Success!</p>
                  <p><strong>New Mint Address:</strong></p>
                  <p className="address-text">{mintAddress}</p>
                  <p><strong>Transaction:</strong> <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>
                </div>
              )}
            </div>
          ) : (
            <p className="connect-prompt">Please connect your wallet to begin.</p>
          )}
        </div>
      </main>
    </div>
  );
}
