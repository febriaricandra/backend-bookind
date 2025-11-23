import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create books
  const books = await prisma.book.createMany({
    data: [
      {
        title: 'Belajar Node.js',
        author: 'Febriari Candra',
        price: 100000,
        condition: 'Baru',
        category: 'Programming',
        story: 'Panduan lengkap belajar Node.js untuk pemula.',
        accessible: true,
        ownerId: user.id,
      },
      {
        title: 'Dasar-dasar TypeScript',
        author: 'Febriari Candra',
        price: 120000,
        condition: 'Bekas',
        category: 'Programming',
        story: 'Buku referensi TypeScript untuk developer JavaScript.',
        accessible: false,
        ownerId: admin.id,
      },
    ],
  });

  logger.info('Database seeded successfully!');
  logger.info('Admin user:', { email: admin.email, password: 'password123' });
  logger.info('Regular user:', { email: user.email, password: 'password123' });
}

main()
  .catch((e) => {
    logger.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
