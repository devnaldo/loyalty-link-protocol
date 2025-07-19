"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function Home() {
  // State to track if the component has mounted on the client
  const [isClient, setIsClient] = useState(false);

  // useEffect runs only on the client, after the initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
      }}
    >
      <h1>LoyaltyLink Merchant Portal</h1>
      <p>Connect your wallet to get started.</p>
      
      {/* Conditionally render the button only on the client to prevent hydration errors */}
      {isClient ? <WalletMultiButton /> : null}
    </main>
  );
}
