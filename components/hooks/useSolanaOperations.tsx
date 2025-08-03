"use client";

import { useState } from 'react';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { SavedMint } from '../../types';
import { useSolanaStore } from '../../store/useSolanaStore';

const programId = new web3.PublicKey("8V6oDMwNGK694Gw9VpDaLtVpjpeqDoWG5Bci1vhygPCw");

// Security: Input validation functions
const validatePublicKey = (address: string): boolean => {
  try {
    const pubkey = new web3.PublicKey(address);
    return web3.PublicKey.isOnCurve(pubkey);
  } catch {
    return false;
  }
};

const validateTokenName = (name: string): boolean => {
  return name.length > 0 && name.length <= 32 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
};

const validateMintQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 1_000_000;
};

// Browser-compatible SHA-256 implementation
const sha256 = async (message: string): Promise<Uint8Array> => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    return new Uint8Array(hashBuffer);
  } else {
    // Node.js environment (SSR/build time) - use a simple fallback
    // For build time, we'll use a deterministic fallback
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Simple hash fallback for build time
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to Uint8Array with 8 bytes
    const result = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      result[i] = (hash >> (i * 4)) & 0xff;
    }
    return result;
  }
};

// Secure error handling - don't expose internal details
const handleSecureError = (error: any, userMessage: string) => {
  // Log errors for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error(`Operation failed: ${userMessage}`);
    console.error('Full error details:', error);
  }
  
  // Provide user-friendly error messages
  if (error?.message?.includes('insufficient funds')) {
    throw new Error('Insufficient SOL for transaction fees');
  } else if (error?.message?.includes('blockhash not found')) {
    throw new Error('Network congestion. Please try again.');
  } else if (error?.message?.includes('Simulation failed')) {
    throw new Error('Transaction simulation failed. Please check your inputs.');
  } else if (error?.message?.includes('Invalid account')) {
    throw new Error('Invalid account provided to program');
  } else if (error?.message?.includes('User rejected')) {
    throw new Error('Transaction was cancelled');
  } else {
    // Generic error message - don't expose internal details
    throw new Error(userMessage + '. Please try again.');
  }
};

export const useSolanaOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [createTxSignature, setCreateTxSignature] = useState<string | null>(null);
  const [mintTxSignature, setMintTxSignature] = useState<string | null>(null);
  
  const { connection } = useConnection();
  const wallet = useWallet();

  // Zustand store hooks with proper error handling
  const solanaStore = useSolanaStore();
  const savedMints = solanaStore?.savedMints || [];
  const addMint = solanaStore?.addMint || (() => {});

  const handleCreateMint = async (tokenName: string): Promise<SavedMint | undefined> => {
    // Security: Validate inputs
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Please connect your wallet!");
    }
    
    if (!validateTokenName(tokenName)) {
      throw new Error("Token name must be 1-32 characters and contain only letters, numbers, spaces, hyphens, and underscores");
    }

    setIsLoading(true);
    setCreateTxSignature(null);

    try {
      const newMint = web3.Keypair.generate();
      const instructionName = "create_loyalty_mint";
      
      // Use browser-compatible SHA-256
      const hash = await sha256(`global:${instructionName}`);
      const discriminator = hash.slice(0, 8);
      
      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: newMint.publicKey, isSigner: true, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from(discriminator),
      });

      const latestBlockhash = await connection.getLatestBlockhash('finalized');
      const transaction = new Transaction({ 
        feePayer: wallet.publicKey, 
        recentBlockhash: latestBlockhash.blockhash 
      }).add(instruction);
      
      transaction.partialSign(newMint);
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'processed'
      });
      
      // Security: Wait for confirmation before proceeding
      await connection.confirmTransaction({ 
        ...latestBlockhash, 
        signature 
      }, 'confirmed');
      
      const newMintAddress = newMint.publicKey.toBase58();
      const newMintData: SavedMint = { 
        address: newMintAddress, 
        name: tokenName.trim(),
        createdAt: new Date().toISOString() 
      };
      
      // Use Zustand store
      addMint(newMintData);
      setCreateTxSignature(signature);
      return newMintData;
      
    } catch (error) {
      handleSecureError(error, "Failed to create loyalty program");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintPoints = async (activeMint: SavedMint, recipientAddress: string, mintQuantity: number) => {
    // Security: Comprehensive input validation
    if (!wallet.publicKey || !wallet.signTransaction || !activeMint) {
      throw new Error("Program not selected or wallet not connected!");
    }

    if (!validatePublicKey(recipientAddress)) {
      throw new Error("Invalid recipient address format");
    }

    if (!validateMintQuantity(mintQuantity)) {
      throw new Error("Mint quantity must be between 1 and 1,000,000");
    }

    setIsLoading(true);
    setMintTxSignature(null);

    try {
      const recipient = new web3.PublicKey(recipientAddress);
      const mint = new web3.PublicKey(activeMint.address);
      const associatedTokenAccount = await getAssociatedTokenAddress(mint, recipient);
      const instructions: TransactionInstruction[] = [];
      
      // Check if token account exists, create if needed
      const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
      if (!accountInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey, 
            associatedTokenAccount, 
            recipient, 
            mint
          )
        );
      }
      
      const instructionName = "mint_loyalty_points";
      const hash = await sha256(`global:${instructionName}`);
      const discriminator = hash.slice(0, 8);
      
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
        data: Buffer.concat([Buffer.from(discriminator), quantityBuffer]),
      }));

      const latestBlockhash = await connection.getLatestBlockhash('finalized');
      const transaction = new Transaction({ 
        feePayer: wallet.publicKey, 
        recentBlockhash: latestBlockhash.blockhash 
      }).add(...instructions);
      
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'processed'
      });
      
      // Security: Wait for confirmation
      await connection.confirmTransaction({ 
        ...latestBlockhash, 
        signature 
      }, 'confirmed');
      
      setMintTxSignature(signature);
      
    } catch (error) {
      handleSecureError(error, "Failed to mint points");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCreateMint,
    handleMintPoints,
    isLoading,
    createTxSignature,
    mintTxSignature,
    setCreateTxSignature,
    setMintTxSignature,
    savedMints
  };
};