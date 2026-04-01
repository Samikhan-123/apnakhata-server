/*
  Warnings:

  - You are about to drop the `LedgerEntryTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LedgerEntryTag" DROP CONSTRAINT "LedgerEntryTag_ledgerEntryId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntryTag" DROP CONSTRAINT "LedgerEntryTag_tagId_fkey";

-- DropTable
DROP TABLE "LedgerEntryTag";

-- DropTable
DROP TABLE "Tag";
