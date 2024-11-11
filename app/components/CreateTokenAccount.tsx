"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useState } from "react";

import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { confirmTransaction } from "@solana-developers/helpers";

export default function CreateTokenAccount() {
  const [txSig, setTxSig] = useState("");
  const [tokenAccount, setTokenAccount] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const createTokenAccount = async (event: any) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }
    const owner = new web3.PublicKey(event.target.owner.value);
    const mint = new web3.PublicKey(event.target.mint.value);

    const associatedTokenAddress = await token.getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
    );
   
    const transaction = new web3.Transaction().add(
      token.createAssociatedTokenAccountInstruction(
        publicKey,
        associatedTokenAddress,
        publicKey,
        mint,
      ),
    );

    console.log("Sending transaction...")
    let sig = await sendTransaction(transaction, connection,);
    console.log("Transaction confirmed.")
    
    setTxSig(sig);
    setTokenAccount(associatedTokenAddress.toString());
    };


  return (
    <div>
      <br />
      {publicKey ? (
        <form onSubmit={createTokenAccount} className="flex flex-col items-center">
          <label htmlFor="owner">Token Mint:</label>
          <input
            id="mint"
            type="text"
            className="my-2 min-w-[500px] p-4 text-base border-0 font-roboto"
            placeholder="Enter Token Mint"
            required
          />
          <label htmlFor="owner">Token Account Owner:</label>
          <input
            id="owner"
            type="text"
            className="my-2 min-w-[500px] p-4 text-base border-0 font-roboto"
            placeholder="Enter Token Account Owner PublicKey"
            required
          />
          <button type="submit" className="my-2 p-4 text-base border-0 font-roboto bg-slate-400">
            Create Token Account
          </button>
        </form>
      ) : (
        <span></span>
      )}
      {txSig ? (
        <div>
          <p>Token Account Address: {tokenAccount}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};