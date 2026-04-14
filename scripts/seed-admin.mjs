import prisma from '../src/config/prisma.ts';
import bcrypt from 'bcrypt';

const email = 'isamikhan.dev@gmail.com';
const name = 'Dev@Sami';
const password = '2323Sami*'; // Default temporary password

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`User ${email} already exists. Updating role to ADMIN.`);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
  } else {
    console.log(`User ${email} not found. Creating new ADMIN user.`);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: 'ADMIN',
        isVerified: true,
        baseCurrency: 'PKR'
      }
    });
  }

  console.log(`✅ Admin user setup complete for ${email}.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
