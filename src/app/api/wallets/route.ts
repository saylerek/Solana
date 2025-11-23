// app/api/wallets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Keypair } from "@solana/web3.js";
import { WalletCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userWallet = url.searchParams.get("userWallet");
  if (!userWallet) return NextResponse.json([], { status: 400 });

  const wallets = await db.wallet.findMany({
    where: { userId: userWallet },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(wallets);
}

export async function POST(req: NextRequest) {
  try {
    const { userWallet, name, category } = await req.json();
    if (!userWallet || !name || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const count = await db.wallet.count({
      where: { userId: userWallet, category },
    });

    const limits: Record<WalletCategory, number> = {
      MAIN: 20,
      DEV: 20,
      BUNDLERS: 500,
    };
    if (count >= limits[category as WalletCategory]) {
      return NextResponse.json({ error: `Limit ${category} reached` }, { status: 400 });
    }

    const kp = Keypair.generate();

    const wallet = await db.wallet.create({
      data: {
        publicKey: kp.publicKey.toBase58(),
        secretKey: Buffer.from(kp.secretKey).toString("hex"),
        name,
        category: category as WalletCategory,
        userId: userWallet,
      },
    });

    return NextResponse.json(wallet);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
