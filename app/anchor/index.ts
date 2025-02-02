import { Connection, Commitment, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Program, AnchorProvider, web3, Idl, setProvider } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import idl from "./create_token.json";
import { CreateToken } from "./create_token";

const { SystemProgram } = web3;

export const getNetworkUrl = (network: string): string => {
    switch (network) {
        case "localnet":
            return "http://127.0.0.1:8899";
        case "devnet-custom-rpc":
            return "http://127.0.0.1:8899";
        case "devnet":
            return "https://api.devnet.solana.com";
        case "testnet":
            return "https://api.testnet.solana.com";
        case "mainnet":
            return "https://api.mainnet-beta.solana.com";
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
};

export const getNetworkAdapterUrl = (network: string): string => {
    switch (network) {
        case "localnet":
            return "http://127.0.0.1:8899";
        case "devnet-custom-rpc":
            if (process.env.CUSTOM_RPC_URL) {
                return JSON.parse(process.env.CUSTOM_RPC_URL);
            }
            return clusterApiUrl(WalletAdapterNetwork.Devnet);
        case "devnet":
            return clusterApiUrl(WalletAdapterNetwork.Devnet);
        case "testnet":
            return clusterApiUrl(WalletAdapterNetwork.Testnet);
        case "mainnet":
            return clusterApiUrl(WalletAdapterNetwork.Mainnet);
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
};

const network = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_NETWORK!;
const networkUrl = getNetworkAdapterUrl(network); // URL du validateur.
console.log("🚀 ~ networkUrl:", networkUrl);

const opts = {
    preflightCommitment: process.env.NEXT_PUBLIC_REACT_APP_SOLANA_COMMITMENT as Commitment,
};

export const ProgramID = new PublicKey("BpA19FX33MdAQvJiwCEsKCr67YM85pHrJhxYyPdQSGbw");


export const getAnchorProgram = (wallet: Wallet) => {
    if (!wallet) {
        // throw new Error("Wallet not connected");
    }

    const connection = new Connection(networkUrl, opts.preflightCommitment);



    const provider = new AnchorProvider(connection, wallet, opts);
    setProvider(provider);

    // Initialise le programme Anchor.
    const program = new Program(idl as CreateToken, provider); // for "@coral-xyz/anchor": "0.30.1"
    // const program = new Program(idl as NftTicketing, ProgramID, provider); // for "@coral-xyz/anchor": "0.29.0"

    return { program, provider, connection, SystemProgram };
};