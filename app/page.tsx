"use client";

import { useEffect, useState } from "react";
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
  const [savedMints, setSavedMints] = useState<SavedMint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
    setMintTxSignature
  } = useSolanaOperations();

  useEffect(() => {
    setIsClient(true);
    const loadedMints = JSON.parse(localStorage.getItem("solrewards-mints") || "[]");
    setSavedMints(loadedMints);
  }, []);

  // Clear form fields when switching views
  const clearFormFields = () => {
    setRecipientAddress('');
    setMintQuantity(100);
    setMintTxSignature(null);
  };

  // Enhanced transition function
  const triggerPageTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  const handleCreateMint = async () => {
    try {
      const newMintData = await createMint(tokenName, savedMints, setSavedMints);
      if (newMintData) {
        triggerPageTransition(() => {
          setActiveMint(newMintData);
          clearFormFields();
        });
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleMintPoints = () => {
    if (activeMint) {
      mintPoints(activeMint, recipientAddress, mintQuantity);
    }
  };

  const handleSelectMint = (mint: SavedMint) => {
    triggerPageTransition(() => {
      setActiveMint(mint);
      setIsModalOpen(false);
      setCreateTxSignature(null);
      clearFormFields();
    });
  };

  const handleGoToInitialView = () => {
    triggerPageTransition(() => {
      setActiveMint(null);
      setCreateTxSignature(null);
      clearFormFields();
      setTokenName(''); // Also clear the token name when going back
    });
  };

  const handleLogoClick = () => {
    if (activeMint) {
      triggerPageTransition(() => {
        setActiveMint(null);
        setCreateTxSignature(null);
        clearFormFields();
        setTokenName('');
      });
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <Header isClient={isClient} handleLogoClick={handleLogoClick} />
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
                isTransitioning={isTransitioning}
              /> : 
              <InitialView 
                handleCreateMint={handleCreateMint}
                isLoading={isLoading}
                tokenName={tokenName}
                setTokenName={setTokenName}
                savedMints={savedMints}
                openModal={() => setIsModalOpen(true)}
                isTransitioning={isTransitioning}
              />
            ) : (
              <WelcomeView isTransitioning={isTransitioning} />
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
    </>
  );
}