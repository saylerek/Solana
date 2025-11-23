import { db } from "./db"; // jeśli db.ts eksportuje PrismaClient
import { WalletCategory } from "@prisma/client";

export async function saveWallet(data: {
  userId: string;
  name: string;
  category: WalletCategory; // <-- zamiast string
  publicKey: string;
  secretKey: string;
}) {
  return db.wallet.create({
    data,
  });
}

export async function getWalletsByCategory(userId: string, category: WalletCategory) {
  return db.wallet.findMany({
    where: {
      userId,
      category,
    },
  });
}
