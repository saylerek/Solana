import { db } from "./db";

export async function saveWallet(data: {
  userId: string;      // tu poprawione!
  name: string;
  category: string;
  publicKey: string;
  secretKey: string;
}) {
  return db.wallet.create({
    data,
  });
}

export async function getWalletsByCategory(userId: string, category: string) {
  return db.wallet.findMany({
    where: {
      userId,        // poprawione pole
      category,
    },
  });
}
