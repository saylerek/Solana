// route.ts - POST -> generuje nonce i zapisuje w DB (lub cache)
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db"; // assuming prisma, e.g. model AuthChallenge { id, publicKey?, nonce, expiresAt }

export async function POST() {
  // wygeneruj nonce
  const nonce = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // możesz nie znać jeszcze publicKey - zapisz nonce jako anonimowy challenge
  await db.authChallenge.create({
    data: {
      nonce,
      expiresAt,
      used: false,
    },
  });

  return NextResponse.json({ nonce });
}
