import prisma from '../src/config/prisma.ts';

const categories = [
  { name: 'Food', icon: 'Utensils', isSystem: true },
  { name: 'Transport', icon: 'Car', isSystem: true },
  { name: 'Utilities', icon: 'Zap', isSystem: true },
  { name: 'Entertainment', icon: 'Film', isSystem: true },
  { name: 'Health', icon: 'HeartPulse', isSystem: true },
  { name: 'Shopping', icon: 'ShoppingBag', isSystem: true },
  { name: 'Personal Care', icon: 'User', isSystem: true },
  { name: 'Investment', icon: 'TrendingUp', isSystem: true },
  { name: 'Gifts', icon: 'Gift', isSystem: true },
  { name: 'Others', icon: 'PlusCircle', isSystem: true }
];

async function main() {
  console.log('Seeding global categories...');
  
  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { 
        name: { equals: category.name, mode: 'insensitive' },
        userId: null 
      }
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          ...category,
          userId: null
        }
      });
      console.log(`Created global category: ${category.name}`);
    } else {
      console.log(`Global category already exists: ${category.name}`);
    }
  }
  
  console.log('Global categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
