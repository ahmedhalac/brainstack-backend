/*
  Warnings:

  - You are about to drop the column `verificationCodeExpiredAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verificationCodeExpiredAt",
ADD COLUMN     "verificationCodeExpiresAt" TIMESTAMP(3);
