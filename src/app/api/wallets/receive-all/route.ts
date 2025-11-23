import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { getWalletsByCategory } from "@/lib/walletsDb";

const connection = new Connection("https://api.devnet.solana.com");

export async function POST(req: NextRequest) {
  try {
    const { userWallet, targetAddress } = await req.json();

    if (!userWallet || !targetAddress) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const bundlers = await getWalletsByCategory(userWallet, "BUNDLERS");

    if (!bundlers.length) {
      return NextResponse.json({ error: "No bundlers found" }, { status: 404 });
    }

    const target = new PublicKey(targetAddress);

    for (const b of bundlers) {
      const secret = bs58.decode(b.secretKey);
      const bundlerKeypair = Keypair.fromSecretKey(secret);

      const balance = await connection.getBalance(bundlerKeypair.publicKey);

      if (balance > 0.001 * LAMPORTS_PER_SOL) {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: bundlerKeypair.publicKey,
            toPubkey: target,
            lamports: balance - 5000, // zostaw minimalne fee
          })
        );

        await sendAndConfirmTransaction(connection, tx, [bundlerKeypair]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
