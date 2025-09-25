import { PrismaClient, PrescriptionStatus, type DispenseStatus } from '@prisma/client';
import type {
  CreateRxInput,
  DispenseItemInput,
  ReceiveStockInput,
} from '../validation/pharmacy.js';

const prisma = new PrismaClient();

export async function allocateFEFO(drugId: string, location: string, neededQty: number) {
  const batches = await prisma.stockItem.findMany({
    where: { drugId, location, qtyOnHand: { gt: 0 } },
    orderBy: [{ expiryDate: 'asc' }, { createdAt: 'asc' }],
  });
  const picks: Array<{ stockItemId: string; qty: number }> = [];
  let remaining = neededQty;
  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.qtyOnHand, remaining);
    if (take > 0) {
      picks.push({ stockItemId: batch.stockItemId, qty: take });
      remaining -= take;
    }
  }
  return { picks, remaining };
}

export async function checkAllergy(patientId: string, drugNames: string[]): Promise<string[]> {
  try {
    // @ts-ignore Optional table depending on deployment state.
    const allergies = (await prisma.patientAllergy?.findMany({ where: { patientId } })) ?? [];
    const alerts: string[] = [];
    for (const allergy of allergies) {
      const substance = String(allergy.substance ?? '').toLowerCase();
      if (!substance) continue;
      for (const drugName of drugNames) {
        if (drugName.toLowerCase().includes(substance)) {
          alerts.push(allergy.substance);
          break;
        }
      }
    }
    return alerts;
  } catch {
    return [];
  }
}

export async function createPrescription(
  visitId: string,
  doctorId: string,
  patientId: string,
  payload: CreateRxInput,
) {
  const drugIds = payload.items.map((item) => item.drugId);
  const drugs = await prisma.drug.findMany({ where: { drugId: { in: drugIds } } });
  const drugNames = drugs.map((drug) => `${drug.name} ${drug.strength}`.trim());

  const allergyHits = patientId ? await checkAllergy(patientId, drugNames) : [];

  const prescription = await prisma.prescription.create({
    data: {
      visitId,
      doctorId,
      patientId,
      notes: payload.notes ?? null,
      items: {
        create: payload.items.map((item) => ({
          drugId: item.drugId,
          dose: item.dose,
          route: item.route,
          frequency: item.frequency,
          durationDays: item.durationDays,
          quantityPrescribed: item.quantityPrescribed,
          prn: Boolean(item.prn),
          allowGeneric: item.allowGeneric ?? true,
          notes: item.notes ?? null,
        })),
      },
    },
    include: { items: true },
  });

  return { prescription, allergyHits };
}

export async function receiveStock(items: ReceiveStockInput) {
  return prisma.$transaction(async (tx) => {
    const created = [] as Array<{ stockItemId: string }>;
    for (const item of items) {
      created.push(
        await tx.stockItem.create({
          data: {
            drugId: item.drugId,
            batchNo: item.batchNo ?? null,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            location: item.location,
            qtyOnHand: item.qtyOnHand,
            unitCost: item.unitCost ?? null,
          },
        }),
      );
    }
    return created;
  });
}

export async function getPharmacyQueue(
  status: PrescriptionStatus[] = [PrescriptionStatus.PENDING],
) {
  return prisma.prescription.findMany({
    where: { status: { in: status } },
    orderBy: { createdAt: 'desc' },
    include: { items: true, patient: true, doctor: true },
  });
}

export async function startDispense(prescriptionId: string, pharmacistId: string) {
  return prisma.dispense.create({
    data: {
      prescriptionId,
      pharmacistId,
      status: 'READY',
    },
  });
}

export async function addDispenseItem(
  dispenseId: string,
  item: DispenseItemInput,
) {
  return prisma.dispenseItem.create({
    data: {
      dispenseId,
      prescriptionItemId: item.prescriptionItemId,
      stockItemId: item.stockItemId ?? null,
      drugId: item.drugId,
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? null,
    },
  });
}

export async function completeDispense(
  dispenseId: string,
  status: Extract<DispenseStatus, 'COMPLETED' | 'PARTIAL'>,
) {
  return prisma.$transaction(async (tx) => {
    const dispense = await tx.dispense.findUnique({
      where: { dispenseId },
      include: {
        items: true,
        prescription: {
          include: { items: true },
        },
      },
    });

    if (!dispense) {
      throw new Error('NOT_FOUND');
    }

    for (const item of dispense.items) {
      if (!item.stockItemId) continue;
      const updated = await tx.stockItem.update({
        where: { stockItemId: item.stockItemId },
        data: { qtyOnHand: { decrement: item.quantity } },
      });
      if (updated.qtyOnHand < 0) {
        throw new Error('OUT_OF_STOCK_RACE');
      }
    }

    await tx.dispense.update({
      where: { dispenseId },
      data: {
        status,
        dispensedAt: new Date(),
      },
    });

    const totals = await tx.dispenseItem.groupBy({
      by: ['prescriptionItemId'],
      _sum: { quantity: true },
      where: {
        dispense: {
          prescriptionId: dispense.prescriptionId,
        },
      },
    });

    const allMet = dispense.prescription.items.every((rxItem) => {
      const sum = totals.find((t) => t.prescriptionItemId === rxItem.itemId)?._sum.quantity ?? 0;
      return sum >= rxItem.quantityPrescribed;
    });

    const finalStatus = allMet ? PrescriptionStatus.DISPENSED : PrescriptionStatus.PARTIAL;

    await tx.prescription.update({
      where: { prescriptionId: dispense.prescriptionId },
      data: { status: finalStatus },
    });

    return { ok: true, prescriptionStatus: finalStatus };
  });
}
