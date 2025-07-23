import { useState } from 'react';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import sha256 from "js-sha256";
import { SavedMint } from '../../types';

const programId = new web3.PublicKey("8V6oDMwNGK694Gw9VpDaLtVpjpeqDoWG5Bci1vhygPCw");

export const useSolanaOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [createTxSignature, setCreateTxSignature] = useState<string | null>(null);
  const [mintTxSignature, setMintTxSignature] = useState<string | null>(null);
  
  const { connection } = useConnection();
  const wallet = useWallet();

  const handleCreateMint = async (tokenName: string, savedMints: SavedMint[], setSavedMints: (mints: SavedMint[]) => void) => {
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

      setCreateTxSignature(signature);
      return newMintData;
    } catch (error) {
      console.error("Error creating mint:", error);
      alert("Failed to create loyalty program. See console for details.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintPoints = async (activeMint: SavedMint, recipientAddress: string, mintQuantity: number) => {
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

  return {
    handleCreateMint,
    handleMintPoints,
    isLoading,
    createTxSignature,
    mintTxSignature,
    setCreateTxSignature,
    setMintTxSignature
  };
};