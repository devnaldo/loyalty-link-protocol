import type { Metadata } from "next";
import ClientWalletProvider from "./WalletProvider"; // This imports the component from your file
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