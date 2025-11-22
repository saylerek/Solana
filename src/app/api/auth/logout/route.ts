import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/authServer";

export async function POST() {
  const session = await getServerSession();
  await session.destroy();

  return NextResponse.json({ success: true });
}
