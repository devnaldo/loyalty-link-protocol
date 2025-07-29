import { useState } from 'react';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import sha256 from "js-sha256";
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

// Secure error handling - don't expose internal details
const handleSecureError = (error: any, userMessage: string) => {
  // TEMPORARY: Log full error for debugging
  console.error(`Operation failed: ${userMessage}`);
  console.error('Full error details:', error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  
  // Don't expose internal error details to users
  if (error?.message?.includes('insufficient funds')) {
    throw new Error('Insufficient SOL for transaction fees');
  } else if (error?.message?.includes('blockhash not found')) {
    throw new Error('Network congestion. Please try again.');
  } else if (error?.message?.includes('Simulation failed')) {
    throw new Error(`Transaction simulation failed: ${error.message}`);
  } else if (error?.message?.includes('Invalid account')) {
    throw new Error('Invalid account provided to program');
  } else {
    throw new Error(`${userMessage}: ${error?.message || 'Unknown error'}`);
  }
};

export const useSolanaOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [createTxSignature, setCreateTxSignature] = useState<string | null>(null);
  const [mintTxSignature, setMintTxSignature] = useState<string | null>(null);
  
  const { connection } = useConnection();
  const wallet = useWallet();

  // Zustand store hooks with fallback
  const { savedMints = [], addMint } = useSolanaStore() || { savedMints: [], addMint: () => {} };

  const handleCreateMint = async (tokenName: string): Promise<SavedMint | undefined> => {
    // Security: Validate inputs
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Please connect your wallet!");
    }
    
    if (!validateTokenName(tokenName)) {
      throw new Error("Token name must be 1-32 characters and contain only letters, numbers, spaces, hyphens, and underscores");
    }

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
      const transaction = new Transaction({ 
        feePayer: wallet.publicKey, 
        recentBlockhash: latestBlockhash.blockhash 
      }).add(instruction);
      
      transaction.partialSign(newMint);
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
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
      
      // Use Zustand store instead of localStorage
      addMint(newMintData);

      setCreateTxSignature(signature);
      return newMintData; // FIXED: This return was missing!
      
    } catch (error) {
      handleSecureError(error, "Failed to create loyalty program");
      return undefined; // FIXED: Added explicit return for error case
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
      const transaction = new Transaction({ 
        feePayer: wallet.publicKey, 
        recentBlockhash: latestBlockhash.blockhash 
      }).add(...instructions);
      
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
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
    savedMints // Export savedMints from store
  };
};