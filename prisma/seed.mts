import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPharmacyReference() {
  const drugs = await prisma.$transaction([
    prisma.drug.upsert({
      where: { drugId: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        drugId: '00000000-0000-0000-0000-000000000001',
        name: 'Amoxicillin',
        genericName: 'amoxicillin',
        form: 'tab',
        strength: '500 mg',
        routeDefault: 'PO',
      },
    }),
    prisma.drug.upsert({
      where: { drugId: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        drugId: '00000000-0000-0000-0000-000000000002',
        name: 'Paracetamol',
        genericName: 'acetaminophen',
        form: 'tab',
        strength: '500 mg',
        routeDefault: 'PO',
      },
    }),
    prisma.drug.upsert({
      where: { drugId: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        drugId: '00000000-0000-0000-0000-000000000003',
        name: 'Ibuprofen',
        genericName: 'ibuprofen',
        form: 'tab',
        strength: '200 mg',
        routeDefault: 'PO',
      },
    }),
  ]);

  for (const drug of drugs) {
    await prisma.stockItem.create({
      data: {
        drugId: drug.drugId,
        batchNo: `BATCH-${drug.drugId.slice(-4)}`,
        expiryDate: new Date('2026-12-31'),
        location: 'COUNTER_A',
        qtyOnHand: 200,
        unitCost: 100.0,
      },
    });
  }

  console.log('✅ Seeded drugs + stock');
}

async function main() {
  // Run legacy seed first to ensure baseline data remains available.
  await import('./seed.mjs');
  await seedPharmacyReference();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
