/*
  Warnings:

  - You are about to drop the column `accountId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `RecurringPattern` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_accountId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringPattern" DROP CONSTRAINT "RecurringPattern_accountId_fkey";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "RecurringPattern" DROP COLUMN "accountId";

-- DropTable
DROP TABLE "Account";

-- DropEnum
DROP TYPE "AccountType";
