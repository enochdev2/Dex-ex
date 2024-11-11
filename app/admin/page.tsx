"use client";
import * as web3 from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAnchorProgram } from "../anchor";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";



const connection = new Connection("https://api.devnet.solana.com");



export default function TokenManagement() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const router = useRouter();
  const [devAddress, setdevAddress] = useState<any>()
  const [devWallets, setdevWallets] = useState<any>()


  useEffect(() => {

  }, [])
  


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
     const devWalletAccount = await program.account.devwallet.fetch(devwallet);
     setdevWallets(devWalletPubkey.toString())
     console.log("🚀 ~ fetching ~ devWalletPubkey:", devWalletPubkey.toString(), "and", devWalletAccount.admin.toString())
      setdevAddress(devWalletAccount.admin.toString());

    };
    fetching();
  }, []);

  const wallet = useAnchorWallet();
  //@ts-ignore
  const { program } = getAnchorProgram(wallet);
  
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "amount") setAmount(value);
  };

  if(devAddress !== devWallets){
        router.push("/")
  }

  const handleMintSubmit = async (e: any) => {
    e.preventDefault();
    setIsMinting(true);
    setError("");
    setSuccess("");
    console.log("Amount", amount);

    try {
      // Connect Phantom wallet
      await window.solana.connect();
      const devWalletPubkey = window.solana.publicKey;
      //   if (!publicKey) {
      //     setError('Please connect your wallet.');
      //     return;
      //   }
      if (error) {
        setError("Access Denied: Developer wallet required.");
        return;
      }

      const mintAccounts = new PublicKey(
        "GYNdve5Wdj38wpVTwwdaPZ6YhdygR5z4La34fRkxcB6C"
      );

      // Get or create associated token account for the recipient (admin)
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        devWalletPubkey, // Phantom wallet pays any creation fees
        mintAccounts, // Mint address
        devWalletPubkey // Recipient's public key for the associated token account
      );
      let devwallet, devwalletBump;
      // Derive devwallet PDA
      [devwallet, devwalletBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("DEV_WALLET"), devWalletPubkey.toBuffer()],
        program.programId
      );

      // Define the amount of tokens to mint
      const amounts = new BN(+amount); // Adjust as needed

      // Mint tokens using the Anchor program
      await program.methods
        .buyToken(amounts)
        .accounts({
          mintAuthority: devWalletPubkey, // Phantom wallet as mint authority
          devwallet: devwallet, // Dev wallet
          recipient: devWalletPubkey, // Recipient
          mintAccount: mintAccounts, // Mint address
        })
        .signers([]) // Phantom wallet handles signing
        .rpc();

      console.log(
        "Tokens minted successfully to:",
        recipientTokenAccount.address.toString()
      );
      setSuccess("Tokens successfully minted!");
    } catch (err) {
      setError("Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  const handleBurnSubmit = async (e: any) => {
    e.preventDefault();
    setIsBurning(true);
    setError("");
    setSuccess("");

    try {
      await window.solana.connect();
      const devWalletPubkey = window.solana.publicKey;

      if (error) {
        setError("Access Denied: Developer wallet required.");
        return;
      }

      const mintAccounts = new PublicKey(
        "GYNdve5Wdj38wpVTwwdaPZ6YhdygR5z4La34fRkxcB6C"
      );

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        devWalletPubkey, // Phantom wallet pays any creation fees
        mintAccounts, // Mint address
        devWalletPubkey // Recipient's public key for the associated token account
      );
      
      let devwallet, devwalletBump;
      // Derive devwallet PDA
      [devwallet, devwalletBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("DEV_WALLET"), devWalletPubkey.toBuffer()],
        program.programId
      );

      const devwalletAcc = new PublicKey(recipientTokenAccount.address.toString());

      const amounts = new BN(+amount * 10 ** 6);
      console.log("🚀 ~ handleBurnSubmit ~ amounts:", amounts)

      // Mint tokens using the Anchor program
      await program.methods
        .sellToken(amounts)
        .accounts({
          authority: devWalletPubkey, // Phantom wallet as mint authority
          devwallet: devwallet, // Dev wallet
          devWalletTokenAccount: devwalletAcc, // Recipient
          mint: mintAccounts, // Mint address
        })
        .signers([]) // Phantom wallet handles signing
        .rpc();

      console.log("Burning tokens:", amount);

      setSuccess("Tokens successfully burned!");
    } catch (err) {
      setError("Burning failed. Please try again.");
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <div className=" items-center justify-center w-screen bg-black h-screen">
      <h2 className="text-2xl px-2 font-bold text-center text-[#a21fc7] mb-6">
        Token Management
      </h2>

      <div className="  flex justify-center w-screen gap-5 px-10 bg-[#040e1f] h-screen">
        <div className="gap-3 h-[70%] flex-1 justify-center items-center flex  p-8 bg-gradient-to-tr from-[#07051c] to-[#370539] rounded mx-auto shadow-lg">
          {/* Error/Success Messages */}
          {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
          {success && <p className="mb-4 text-green-500 text-sm">{success}</p>}

          {/* Mint Tokens (Buy Tokens) Form */}
          <form onSubmit={handleMintSubmit} className="mb-6 w-50%">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Buy Tokens
            </h3>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isMinting}
              className="w-full py-3 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMinting ? "Minting..." : "Mint Tokens"}
            </button>
          </form>
        </div>
        <div className="flex-1 gap-3 h-[70%] justify-center items-center flex  p-8 bg-red-300 rounded mx-auto shadow-lg">
          {/* Error/Success Messages */}
          {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
          {success && <p className="mb-4 text-green-500 text-sm">{success}</p>}

          {/* Burn Tokens (Sell Tokens) Form */}
          <form onSubmit={handleBurnSubmit}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Sell Tokens
            </h3>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isBurning}
              className="w-full py-3 text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {isBurning ? "Burning..." : "Burn Tokens"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
