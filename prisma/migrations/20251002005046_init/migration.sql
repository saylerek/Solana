-- CreateEnum
CREATE TYPE "public"."WalletCategory" AS ENUM ('MAIN', 'DEV', 'BUNDLERS');

-- CreateTable
CREATE TABLE "public"."User" (
    "phantomWallet" TEXT NOT NULL,
    "secretkey" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("phantomWallet")
);

-- CreateTable
CREATE TABLE "public"."AuthChallenge" (
    "id" SERIAL NOT NULL,
    "nonce" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."WalletCategory" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthChallenge_nonce_key" ON "public"."AuthChallenge"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_publicKey_key" ON "public"."Wallet"("publicKey");

-- CreateIndex
CREATE INDEX "Wallet_userId_category_idx" ON "public"."Wallet"("userId", "category");

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("phantomWallet") ON DELETE RESTRICT ON UPDATE CASCADE;
