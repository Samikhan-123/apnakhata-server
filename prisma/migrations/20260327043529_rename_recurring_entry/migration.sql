/*
  Warnings:

  - You are about to drop the `RecurringPattern` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecurringPattern" DROP CONSTRAINT "RecurringPattern_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringPattern" DROP CONSTRAINT "RecurringPattern_userId_fkey";

-- DropTable
DROP TABLE "RecurringPattern";

-- CreateTable
CREATE TABLE "RecurringEntry" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "frequency" "Frequency" NOT NULL DEFAULT 'MONTHLY',
    "nextExecution" TIMESTAMP(3) NOT NULL,
    "lastExecution" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecurringEntry" ADD CONSTRAINT "RecurringEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringEntry" ADD CONSTRAINT "RecurringEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
