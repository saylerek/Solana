import { db } from "@/lib/db";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export async function POST(req: Request) {
  try {
    const { userWallet, count } = await req.json();

    const user = await db.User.findUnique({
      where: { phantomWallet: userWallet },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const wallets = [];
    for (let i = 0; i < count; i++) {
      const kp = Keypair.generate();

      const wallet = await db.Wallet.create({
        data: {
          publicKey: kp.publicKey.toBase58(),
          secretKey: bs58.encode(kp.secretKey),
          name: `Bundler ${i + 1}`,
          category: "BUNDLERS",
          userId: user.phantomWallet,
        },
      });

      wallets.push(wallet);
    }

    return new Response(JSON.stringify(wallets), { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
