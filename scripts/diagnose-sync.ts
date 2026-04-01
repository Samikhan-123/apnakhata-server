import prisma from '../src/config/prisma.js';

async function diagnose() {
  console.log('--- SYNC DIAGNOSTIC V3 START ---');
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;
    
    const entry = await prisma.recurringEntry.findFirst({
      where: { userId: user.id }
    });

    if (!entry) {
      console.log('No recurring entries found for user.');
      return;
    }

    console.log('Entry Category ID:', entry.categoryId);
    const category = await prisma.category.findUnique({
      where: { id: entry.categoryId || '' }
    });
    console.log('Category exists:', !!category);
    if (category) {
      console.log('Category UserID match:', category.userId === user.id);
    }

    // Check Balance
    const stats: any = await prisma.ledgerEntry.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _sum: { amount: true }
    });

    const income = Number(stats.find((s: any) => s.type === 'INCOME')?._sum.amount || 0);
    const expense = Number(stats.find((s: any) => s.type === 'EXPENSE')?._sum.amount || 0);
    const balance = income - expense;

    console.log(`Financial Summary - Income: ${income}, Expense: ${expense}, Balance: ${balance}`);
    console.log(`Requires: ${entry.amount}`);
    console.log(`Passes Balance Check: ${balance >= Number(entry.amount)}`);

  } catch (err: any) {
    console.error('DIAGNOSTIC FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
    console.log('--- SYNC DIAGNOSTIC V3 END ---');
  }
}

diagnose();
