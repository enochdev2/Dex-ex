"use client"

import { useState } from 'react';
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAnchorProgram } from '../anchor';




const connection = new Connection("https://api.devnet.solana.com"); 


export default function TransferToken() {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
  });
  
  const wallet = useAnchorWallet();
  //@ts-ignore
  const { program } = getAnchorProgram(wallet);

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await window.solana.connect();
      const devWalletPubkey = window.solana.publicKey;
  
      // Define mint address and recipient wallet address
      const mintAccounts = new PublicKey("GYNdve5Wdj38wpVTwwdaPZ6YhdygR5z4La34fRkxcB6C");
      const dumeAccount = new PublicKey("HWcqDC8VhUVEeNQdmrfCLUSJgMD6h4vaTE6wTJh5XvyG");
      const recieverAccounts = new PublicKey(formData.recipient);
      const recieverAccount = new PublicKey("CnV7Dq3k73JPhLvFYkkE9mNGFKaHPSXDbv8DdVCANZnc");
  
      // Retrieve or create the associated token accounts
      const devWalletTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        devWalletPubkey,       // Phantom wallet pays any creation fees
        mintAccounts,          // Mint address
        devWalletPubkey        // Owner of the dev wallet token account
      );
      console.log("🚀 ~ handleSubmit ~ devWalletTokenAccount:", devWalletTokenAccount)

      const toWalletTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        devWalletPubkey,       // Phantom wallet pays any creation fees
        mintAccounts,          // Mint address
        dumeAccount
        // recieverAccount            // Owner of the recipient's token account
      );
      console.log("🚀 ~ handleSubmit ~ toWalletTokenAccount:", toWalletTokenAccount)
  
      // Define transfer amount (e.g., 50 million lamports, adjust as needed)
      const transferAmount = new BN(+formData.amount * 10 ** 6);
      console.log("🚀 ~ handleSubmit ~ transferAmount:", transferAmount)


        // Transfer tokens using Phantom wallet
    await program.methods
    .transferToken(transferAmount)
    .accounts({
      authority: devWalletPubkey,                    // Phantom wallet address as authority
      from: devWalletTokenAccount.address,           // Dev wallet associated token account
      to: toWalletTokenAccount.address,              // Recipient's associated token account
      // @ts-ignore
      mint: mintAccounts,                            // Mint address
    })
    .signers([])                                     // Phantom wallet handles signing, no additional signers
    .rpc();

  // Check recipient's token balance
  const recipientTokenBalance = await connection.getTokenAccountBalance(
    toWalletTokenAccount.address
  );
  console.log("🚀 Recipient Token Balance:", recipientTokenBalance.value.amount.toString());
  
      // Here you would call the smart contract function to transfer tokens
      console.log('Transferring tokens:', transferAmount);

      // Simulate a successful transaction
      alert('Transfer successful');
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#03071f00]">
      <div className="w-full max-w-lg p-8 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Transfer Tokens</h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="recipient" className="block mb-2 text-sm font-medium text-gray-700">Recipient Address</label>
            <input
              type="text"
              name="recipient"
              id="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSubmitting ? 'Transferring...' : 'Transfer Tokens'}
          </button>
        </form>
      </div>
    </div>
  );
}
