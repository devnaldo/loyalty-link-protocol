import type { Metadata } from "next";
import ClientWalletProvider from "./WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoyaltyLink",
  description: "LoyaltyLink Merchant Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
