import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LoyaltyLinkProgram } from "../target/types/loyalty_link_program";
import { assert } from "chai";
import { 
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

describe("loyalty-link-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LoyaltyLinkProgram as Program<LoyaltyLinkProgram>;
  const merchant = provider.wallet;

  it("Creates a mint and mints points to a customer!", async () => {
    // === Part 1: Create the Loyalty Token Mint ===
    const loyaltyMint = anchor.web3.Keypair.generate();
    
    await program.methods
      .createLoyaltyMint()
      .accounts({
        mint: loyaltyMint.publicKey,
        merchant: merchant.publicKey,
      })
      .signers([loyaltyMint])
      .rpc();

    const mintAccount = await anchor.getProvider().connection.getAccountInfo(loyaltyMint.publicKey);
    assert.isNotNull(mintAccount, "The mint account should be created and not null.");
    console.log("Step 1 PASSED: Loyalty Mint Created.");


    // === Part 2: Manually Create the Customer's Token Account ===
    const customer = anchor.web3.Keypair.generate();

    // Find the deterministic address for the customer's Associated Token Account (ATA).
    const customerTokenAccountAddress = await getAssociatedTokenAddress(
      loyaltyMint.publicKey,
      customer.publicKey
    );

    // Build the instruction to create the ATA.
    const createAtaInstruction = createAssociatedTokenAccountInstruction(
      merchant.publicKey, // Payer
      customerTokenAccountAddress,
      customer.publicKey, // Owner
      loyaltyMint.publicKey // Mint
    );

    // Put the instruction into a transaction and send it.
    const createAtaTx = new anchor.web3.Transaction().add(createAtaInstruction);
    await provider.sendAndConfirm(createAtaTx, []);
    console.log("Step 2 PASSED: Customer Token Account Created.");


    // === Part 3: Mint Loyalty Points to the new account ===
    const pointsToMint = new anchor.BN(100);

    await program.methods
      .mintLoyaltyPoints(pointsToMint)
      .accounts({
        mint: loyaltyMint.publicKey,
        merchant: merchant.publicKey,
        customerTokenAccount: customerTokenAccountAddress,
      })
      .rpc();
    
    const accountInfo = await getAccount(provider.connection, customerTokenAccountAddress);
    
    assert.strictEqual(accountInfo.amount.toString(), "100", "The customer's balance should be 100.");
    console.log("Step 3 PASSED: 100 Points Minted to Customer.");
  });
});
