/*
  Warnings:

  - A unique constraint covering the columns `[gameKeyId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('Available', 'Sold', 'Refunded');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "gameKeyId" INTEGER;

-- CreateTable
CREATE TABLE "GameKey" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "status" "KeyStatus" NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "GameKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameKey_code_key" ON "GameKey"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_gameKeyId_key" ON "OrderItem"("gameKeyId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_gameKeyId_fkey" FOREIGN KEY ("gameKeyId") REFERENCES "GameKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameKey" ADD CONSTRAINT "GameKey_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
