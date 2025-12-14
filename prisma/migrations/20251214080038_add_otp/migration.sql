-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpExpiredAt" TIMESTAMP(3),
ADD COLUMN     "otpHash" TEXT;
