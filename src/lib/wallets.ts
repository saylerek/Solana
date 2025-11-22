import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { encryptString, decryptString } from "./crypto";
import { idbPut, idbGetAll, idbDelete } from "./storage";

export type StoredWallet = {
  name: string;
  publicKey: string;
  encryptedSecret: string;
};

const PASSWORD = "test-pass"; // 🔑 potem podmienisz na hasło użytkownika

export async function saveWallet(name: string, kp: Keypair) {
  const secretBase58 = bs58.encode(kp.secretKey);
  const encryptedSecret = await encryptString(secretBase58, PASSWORD);

  const wallet: StoredWallet = {
    name,
    publicKey: kp.publicKey.toBase58(),
    encryptedSecret,
  };

  await idbPut(wallet.publicKey, JSON.stringify(wallet));
  return wallet;
}

export async function loadWallets(): Promise<StoredWallet[]> {
  const all = await idbGetAll();
  return Object.values(all).map((v) => JSON.parse(v) as StoredWallet);
}

export async function deleteWallet(publicKey: string) {
  await idbDelete(publicKey);
}

export async function exportWallets(): Promise<string> {
  const wallets = await loadWallets();
  return JSON.stringify(wallets, null, 2);
}

export async function importWallets(json: string) {
  const wallets: StoredWallet[] = JSON.parse(json);
  for (const w of wallets) {
    await idbPut(w.publicKey, JSON.stringify(w));
  }
  return wallets;
}

export async function getSecretKey(publicKey: string): Promise<Uint8Array | null> {
  const all = await idbGetAll();
  const raw = all[publicKey];
  if (!raw) return null;

  const wallet: StoredWallet = JSON.parse(raw);
  const secretBase58 = await decryptString(wallet.encryptedSecret, PASSWORD);
  return bs58.decode(secretBase58);
}
