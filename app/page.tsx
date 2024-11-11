"use client"
import AppBar from "./components/AppBar"
import WalletContextProvider from "./components/WalletContextProvider";
import { BalanceDisplay } from "./components/BalanceDisplay";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAnchorProgram } from './anchor';
import { SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";


const connection = new Connection("https://api.devnet.solana.com"); 


export default function Home() {
  const [devAddress, setdevAddress] = useState<any>()
  console.log("🚀 ~ Home ~ devAddress:", devAddress)

  const wallet = useAnchorWallet();
  //@ts-ignore
  const { program } = getAnchorProgram(wallet);


   useEffect(() => {
     async function fetching () {
       // Fetch token account balance
       await window.solana.connect();
       const devWalletPubkey = window.solana.publicKey;
      //  let devwallets, 
      let adminPublickey : PublicKey = new PublicKey("AXpiGXaNqNgjRGKgYExZk9Ye3xo2EwVABhMFzcQGbCvf")
     let devwallet, devwalletBump;
      [devwallet, ] = PublicKey.findProgramAddressSync(
       [Buffer.from("DEV_WALLET"), adminPublickey.toBuffer()],
       program.programId
     );
       console.log("🚀 ~ fetching ~ devWalletPubkey:", devWalletPubkey)
       const devWalletAccount = await program.account.devwallet.fetch(devwallet);
       setdevAddress(devWalletAccount);
 
      };
      fetching();
  }, []);



  
  const handleSetWallet = async (e:any) => {
    e.preventDefault();

    try {
      await window.solana.connect();
      const devWalletPubkey = window.solana.publicKey;
  
        // Transfer tokens using Phantom wallet
        await program.methods
            .create()
            .accounts({
              // @ts-ignore
              devwallet,
              dev: devWalletPubkey,
              systemProgram: SystemProgram.programId,
            })
            .signers([])
            .rpc();

  
      // Here you would call the smart contract function to transfer tokens
      console.log('Transferring tokens:', devWalletPubkey);

      // Simulate a successful transaction
      alert('Dev wallet successfully registered!');
    } catch (err) {
      console.log('Transfer failed. Please try again.');
    };
  };

  return (
    <div className="min-h-screen flex flex-col text-left bg-gray-800">
      <div className="h-full flex flex-col items-center justify-start text-[calc(10px+2vmin)] text-white pt-12">
        <span>CUSTOM MINT FORM</span>
        <BalanceDisplay />
        {!devAddress &&
        <button type="button" onClick={handleSetWallet}>
          Set Devwallet
        </button>
        }
    </div>
    </div>
  );
}