// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/authServer";

export async function GET() {
  const session = await getServerSession();
  if (!session?.isLoggedIn || !session?.phantomWallet) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: session });
}
