import { db } from "@/lib/db";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { WalletCategory } from "@prisma/client";
import { Wallet } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { userWallet, count } = await req.json();

    const user = await db.user.findUnique({
      where: { phantomWallet: userWallet },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const wallets: Wallet[] = [];
    for (let i = 0; i < count; i++) {
      const kp = Keypair.generate();

      const wallet = await db.wallet.create({
        data: {
          publicKey: kp.publicKey.toBase58(),
          secretKey: bs58.encode(kp.secretKey),
          name: `Bundler ${i + 1}`,
          category: WalletCategory.BUNDLERS,
          userId: user.phantomWallet,
        },
      });

      wallets.push(wallet);
    }

    return new Response(JSON.stringify(wallets), { status: 200 });
} catch (e: unknown) {
  let message = "Unknown error";
  if (e instanceof Error) {
    message = e.message;
  }
  console.error(message);
  return new Response(JSON.stringify({ error: message }), { status: 500 });
}
}
