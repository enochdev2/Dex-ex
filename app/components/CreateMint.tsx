"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useState } from "react";
import { confirmTransaction } from "@solana-developers/helpers";

export default function CreateMint() {
  const [txSig, setTxSig] = useState("");
  const [mint, setMint] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const createMint = async (event: any) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
    const mint = web3.Keypair.generate();
    const programId = token.TOKEN_PROGRAM_ID;
   
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        space: token.MINT_SIZE,
        lamports,
        programId,
      }),
      token.createInitializeMintInstruction(
        mint.publicKey,
        0,
        publicKey,
        publicKey,
        programId,
      ),
    );

    try {
    let sig = await sendTransaction(transaction, connection, {signers: [mint]})

    setTxSig(sig);
    setMint(mint.publicKey.toString());
    }
    catch(e) {
      console.log(e)
    }
}

  return (
    <div>
      {publicKey ? (
        <form onSubmit={createMint} className="flex flex-col items-center">
          <button type="submit" className="my-2 p-4 text-base border-0 font-roboto bg-slate-400">
            Create Mint
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div>
          <p>Token Mint Address: {mint}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};