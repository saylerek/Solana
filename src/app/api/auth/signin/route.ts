// src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/authServer";

export async function POST(request: NextRequest) {
  try {
    const { phantomWallet, signature, nonce } = await request.json();

    if (!phantomWallet || !signature || !nonce) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const challenge = await db.authChallenge.findUnique({
      where: { nonce },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 });
    }

    if (challenge.used || new Date() > challenge.expiresAt) {
      return NextResponse.json({ error: "Challenge already used or expired" }, { status: 400 });
    }

    const messageBytes = new TextEncoder().encode(nonce);
    const signatureBytes = Uint8Array.from(signature);
    const pubKeyBytes = bs58.decode(phantomWallet);

    const ok = nacl.sign.detached.verify(messageBytes, signatureBytes, pubKeyBytes);
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await db.authChallenge.update({
      where: { id: challenge.id },
      data: { used: true },
    });

    let user = await db.user.findUnique({ 
      where: { phantomWallet },
      include: { wallets: true },
    });
if (!user) {
  const serverSecret = Buffer.from(require("crypto").randomBytes(32)).toString("hex");
  user = await db.user.create({
    data: {
      phantomWallet,
      secretkey: serverSecret,
    },
    include: { wallets: true }, // <--- też dobrze dołączyć relacje
  });
}

    // tutaj używamy serwerowej funkcji do sesji
    const session = await getServerSession();
    session.phantomWallet = user.phantomWallet;
    session.isLoggedIn = true;
    session.secretKey = user.secretkey;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        phantomWallet: user.phantomWallet,
        secretKey: user.secretkey,
        wallets: user.wallets || [],
      }
    });

  } catch (err) {
    console.error("signin error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
