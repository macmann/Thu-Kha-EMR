import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('AdminPass123!', 10);
  const doctorPass = await bcrypt.hash('DoctorPass123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPass,
      role: 'Admin',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { email: 'drsmith@example.com' },
    update: {},
    create: {
      email: 'drsmith@example.com',
      passwordHash: doctorPass,
      role: 'Doctor',
      status: 'active',
    },
  });

  console.log('✅ Seeded default Admin & Doctor accounts');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
