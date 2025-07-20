"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { LoyaltyLinkProgram } from "../target/types/loyalty_link_program";
import idl from "../target/idl/loyalty_link_program.json";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  // Call useWallet() once at the top level
  const wallet = useWallet();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateMint = async () => {
    // Check for the publicKey from the wallet object
    if (!wallet.publicKey) {
      alert("Please connect your wallet!");
      return;
    }

    setIsLoading(true);
    setMintAddress(null);
    setTxSignature(null);

    try {
      // Pass the top-level wallet object to the provider
      const provider = new anchor.AnchorProvider(connection, wallet as any, {
        preflightCommitment: "processed",
      });
      const program = new anchor.Program(idl as any, provider);

      const newMint = anchor.web3.Keypair.generate();

      const tx = await program.methods
        .createLoyaltyMint()
        .accounts({
          mint: newMint.publicKey,
          merchant: wallet.publicKey,
        })
        .signers([newMint])
        .rpc();

      setMintAddress(newMint.publicKey.toBase58());
      setTxSignature(tx);
    } catch (error) {
      console.error("Error creating mint:", error);
      alert("Failed to create loyalty program. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>LoyaltyLink Merchant Portal</h1>
      
      {isClient ? <WalletMultiButton /> : <div style={{height: "48px"}}/>}

      {/* Check for the publicKey directly from the wallet object */}
      {wallet.publicKey && (
        <div style={{textAlign: "center"}}>
          <button 
            onClick={handleCreateMint} 
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: isLoading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            {isLoading ? "Creating..." : "Create Loyalty Program"}
          </button>
          {mintAddress && (
            <div style={{marginTop: "20px"}}>
              <p>✅ Success!</p>
              <p><strong>New Mint Address:</strong> {mintAddress}</p>
              <p><strong>Transaction:</strong> <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`} target="_blank" rel="noopener noreferrer">{txSignature.substring(0,20)}...</a></p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
