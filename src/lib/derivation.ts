// lib/derivation.ts
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';


export async function keypairFromMnemonic(mnemonic: string, passphrase = ''): Promise<Keypair> {
const seed = await bip39.mnemonicToSeed(mnemonic, passphrase); // Buffer
// Solana derivation path: m/44'/501'/0'/0' (standard)
const derived = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
const key = derived.key; // Buffer 32
const full = new Uint8Array(64);
// derive keypair from secret seed using tweetnacl via Keypair.fromSeed
const kp = Keypair.fromSeed(new Uint8Array(key));
return kp;
}