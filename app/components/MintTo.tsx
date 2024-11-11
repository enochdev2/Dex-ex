"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useState } from "react";
import {
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
import { confirmTransaction } from "@solana-developers/helpers";

export default function MintTo() {
  const [txSig, setTxSig] = useState("");
  const [tokenAccount, setTokenAccount] = useState("");
  const [balance, setBalance] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const mintTo = async (event: any) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }
    
    const transaction = new web3.Transaction();

    const mintPubKey = new web3.PublicKey(event.target.mint.value);
    const recipientPubKey = new web3.PublicKey(event.target.recipient.value);
    const amount = event.target.amount.value;

    console.log("Retrieving associated token..")
    const associatedToken = await getAssociatedTokenAddress(
      mintPubKey,
      recipientPubKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log("Retrieved.")

    transaction.add(
      createMintToInstruction(mintPubKey, associatedToken, publicKey, amount)
    );

    console.log("Sending transaction...")
    const signature = await sendTransaction(transaction, connection);
    console.log("Sent.")

    setTxSig(signature);
    setTokenAccount(associatedToken.toString());

    const account = await getAccount(connection, associatedToken);
    setBalance(account.amount.toString());
  };

  return (
    <div>
      <br />
      {publicKey ? (
        <form onSubmit={mintTo} className="flex flex-wrap md:flex-row items-center">
          <label htmlFor="mint">Token Mint:</label>
          <input
            id="mint"
            type="text"
            className="my-2 min-w-[500px] p-4 text-base border-0 font-roboto"
            placeholder="Enter Token Mint"
            required
          />
          <label htmlFor="recipient">Recipient:</label>
          <input
            id="recipient"
            type="text"
            className="my-2 min-w-[500px] p-4 text-base border-0 font-roboto"
            placeholder="Enter Recipient PublicKey"
            required
          />
          <label htmlFor="amount">Amount Tokens to Mint:</label>
          <input
            id="amount"
            type="text"
            className="my-2 min-w-[500px] p-4 text-base border-0 font-roboto"
            placeholder="e.g. 100"
            required
          />
          <button type="submit" className="my-2 p-4 text-base border-0 font-roboto bg-slate-400">
            Mint Tokens
          </button>
        </form>
      ) : (
        <span></span>
      )}
      {txSig ? (
        <div>
          <p>Token Balance: {balance} </p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};