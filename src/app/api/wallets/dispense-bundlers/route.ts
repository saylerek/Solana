import { NextRequest, NextResponse } from "next/server";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getWalletsByCategory } from "@/lib/walletsDb";

const connection = new Connection("https://api.devnet.solana.com");

export async function POST(req: NextRequest) {
  try {
    const { userWallet } = await req.json();

    if (!userWallet) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    // pobierz bundlers dla usera
    const bundlers = await getWalletsByCategory(userWallet, "BUNDLERS");

    if (!bundlers.length) {
      return NextResponse.json({ error: "No bundlers found" }, { status: 404 });
    }

    // tu możesz np. używać faucet z devnetu
    for (const b of bundlers) {
      const pk = new PublicKey(b.publicKey);

      // devnet faucet
      await connection.requestAirdrop(pk, 0.1 * LAMPORTS_PER_SOL);
    }

    return NextResponse.json({ success: true, count: bundlers.length });
} catch (err: unknown) {
    if (err instanceof Error) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}
}
