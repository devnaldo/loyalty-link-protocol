"use client";

import React, { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

const ClientWalletProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  // This is the key change. We are explicitly telling our app to connect
  // to the local blockchain running on our computer.
  const endpoint = "http://127.0.0.1:8899";

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    [] // network dependency removed
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default ClientWalletProvider;
