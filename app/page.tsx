"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SavedMint } from '../types';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { ProgramsModal } from '../components/ui/ProgramsModal';
import { WelcomeView } from '../components/views/WelcomeView';
import { InitialView } from '../components/views/InitialView';
import { MintingView } from '../components/views/MintingView';
import { Header } from '../components/layout/Header';
import { useSolanaOperations } from '../components/hooks/useSolanaOperations';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeMint, setActiveMint] = useState<SavedMint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tokenName, setTokenName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [mintQuantity, setMintQuantity] = useState(100);

  const wallet = useWallet();
  const {
    handleCreateMint: createMint,
    handleMintPoints: mintPoints,
    isLoading,
    createTxSignature,
    mintTxSignature,
    setCreateTxSignature,
    setMintTxSignature,
    savedMints
  } = useSolanaOperations();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear form fields when switching views
  const clearFormFields = useCallback(() => {
    setRecipientAddress('');
    setMintQuantity(100);
    setMintTxSignature(null);
    setError(null);
  }, [setMintTxSignature]);

  // Enhanced transition function
  const triggerPageTransition = useCallback((callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  }, []);

  const handleCreateMint = useCallback(async () => {
    if (!tokenName.trim()) {
      setError("Please enter a token name");
      return;
    }

    try {
      setError(null);
      const newMintData = await createMint(tokenName);
      if (newMintData) {
        triggerPageTransition(() => {
          setActiveMint(newMintData);
          clearFormFields();
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to create mint");
    }
  }, [tokenName, createMint, triggerPageTransition, clearFormFields]);

  const handleMintPoints = useCallback(async () => {
    if (!activeMint) {
      setError("No active mint selected");
      return;
    }

    if (!recipientAddress.trim()) {
      setError("Please enter a recipient address");
      return;
    }

    if (mintQuantity <= 0) {
      setError("Please enter a valid mint quantity");
      return;
    }

    try {
      setError(null);
      await mintPoints(activeMint, recipientAddress, mintQuantity);
    } catch (error: any) {
      setError(error.message || "Failed to mint points");
    }
  }, [activeMint, recipientAddress, mintQuantity, mintPoints]);

  const handleSelectMint = useCallback((mint: SavedMint) => {
    triggerPageTransition(() => {
      setActiveMint(mint);
      setIsModalOpen(false);
      setCreateTxSignature(null);
      clearFormFields();
    });
  }, [triggerPageTransition, setCreateTxSignature, clearFormFields]);

  const handleGoToInitialView = useCallback(() => {
    triggerPageTransition(() => {
      setActiveMint(null);
      setCreateTxSignature(null);
      clearFormFields();
      setTokenName('');
    });
  }, [triggerPageTransition, setCreateTxSignature, clearFormFields]);

  const handleLogoClick = useCallback(() => {
    if (activeMint) {
      triggerPageTransition(() => {
        setActiveMint(null);
        setCreateTxSignature(null);
        clearFormFields();
        setTokenName('');
      });
    }
  }, [activeMint, triggerPageTransition, setCreateTxSignature, clearFormFields]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <>
        <AnimatedBackground />
        <div className="container">
          <div className="main-content">
            <div className="card">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <Header isClient={isClient} handleLogoClick={handleLogoClick} />
        <main className="main-content">
          <div className="card">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

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
                openModal={handleOpenModal}
                isTransitioning={isTransitioning}
              /> : 
              <InitialView 
                handleCreateMint={handleCreateMint}
                isLoading={isLoading}
                tokenName={tokenName}
                setTokenName={setTokenName}
                savedMints={savedMints}
                openModal={handleOpenModal}
                isTransitioning={isTransitioning}
              />
            ) : (
              <WelcomeView isTransitioning={isTransitioning} />
            )}
          </div>
          {isModalOpen && 
            <ProgramsModal 
              savedMints={savedMints}
              handleSelectMint={handleSelectMint}
              closeModal={handleCloseModal}
            />
          }
        </main>
      </div>
    </>
  );
}