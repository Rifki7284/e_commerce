/*
  Warnings:

  - You are about to drop the column `gameKeyId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_gameKeyId_fkey";

-- DropIndex
DROP INDEX "OrderItem_gameKeyId_key";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "gameKeyId";

-- CreateTable
CREATE TABLE "OrderItemKey" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "gameKeyId" INTEGER NOT NULL,

    CONSTRAINT "OrderItemKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemKey_gameKeyId_key" ON "OrderItemKey"("gameKeyId");

-- AddForeignKey
ALTER TABLE "OrderItemKey" ADD CONSTRAINT "OrderItemKey_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemKey" ADD CONSTRAINT "OrderItemKey_gameKeyId_fkey" FOREIGN KEY ("gameKeyId") REFERENCES "GameKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
