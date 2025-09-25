import { Router } from 'express';
import { PrismaClient, PrescriptionStatus } from '@prisma/client';
import { z } from 'zod';

import { requireAuth, requireRole, type AuthRequest } from '../modules/auth/index.js';
import { validate } from '../middleware/validate.js';
import {
  CreateRxSchema,
  DispenseItemSchema,
  ReceiveStockSchema,
  type CreateRxInput,
  type DispenseItemInput,
} from '../validation/pharmacy.js';
import {
  addDispenseItem,
  completeDispense,
  createPrescription,
  getPharmacyQueue,
  receiveStock,
  startDispense,
} from '../services/pharmacyService.js';

const prisma = new PrismaClient();
const router = Router();

const CreateDrugSchema = z.object({
  drugId: z.string().uuid().optional(),
  name: z.string().min(1),
  genericName: z.string().optional(),
  form: z.string().min(1),
  strength: z.string().min(1),
  routeDefault: z.string().optional(),
  isActive: z.boolean().optional(),
});

const CompleteDispenseSchema = z.object({
  status: z.enum(['COMPLETED', 'PARTIAL']),
});

router.use(requireAuth);

router.post(
  '/drugs',
  requireRole('ITAdmin'),
  validate({ body: CreateDrugSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const body = req.body as z.infer<typeof CreateDrugSchema>;
      const drug = await prisma.drug.create({ data: body });
      res.status(201).json(drug);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/inventory/receive',
  requireRole('ITAdmin', 'InventoryManager', 'Pharmacist'),
  validate({ body: ReceiveStockSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const payload = req.body as z.infer<typeof ReceiveStockSchema>;
      const created = await receiveStock(payload.items);
      res.status(201).json({ items: created });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/visits/:visitId/prescriptions',
  requireRole('Doctor'),
  validate({ body: CreateRxSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const visitId = req.params.visitId;
      const payload = req.body as CreateRxInput;

      const visit = await prisma.visit.findUnique({
        where: { visitId },
        select: { visitId: true, patientId: true, doctorId: true },
      });

      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      if (req.user?.doctorId && req.user.doctorId !== visit.doctorId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const patientId = payload.patientId ?? visit.patientId;
      const { prescription, allergyHits } = await createPrescription(
        visitId,
        visit.doctorId,
        patientId,
        payload,
      );

      res.status(201).json({ prescription, allergyHits });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/prescriptions',
  requireRole('Pharmacist', 'PharmacyTech', 'ITAdmin'),
  async (req: AuthRequest, res, next) => {
    try {
      const raw = typeof req.query.status === 'string' ? req.query.status.split(',') : undefined;
      const statuses = (raw ?? ['PENDING']).reduce<PrescriptionStatus[]>((acc, value) => {
        const normalized = value.trim().toUpperCase();
        if ((Object.values(PrescriptionStatus) as string[]).includes(normalized)) {
          acc.push(normalized as PrescriptionStatus);
        }
        return acc;
      }, []);

      const queue = await getPharmacyQueue(statuses.length ? statuses : [PrescriptionStatus.PENDING]);
      res.json({ data: queue });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/prescriptions/:prescriptionId/dispenses',
  requireRole('Pharmacist', 'PharmacyTech'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const dispense = await startDispense(req.params.prescriptionId, req.user.userId);
      res.status(201).json(dispense);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/dispenses/:dispenseId/items',
  requireRole('Pharmacist', 'PharmacyTech'),
  validate({ body: DispenseItemSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const payload = req.body as DispenseItemInput;
      const item = await addDispenseItem(req.params.dispenseId, payload);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/dispenses/:dispenseId/complete',
  requireRole('Pharmacist'),
  validate({ body: CompleteDispenseSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const body = req.body as z.infer<typeof CompleteDispenseSchema>;
      const result = await completeDispense(req.params.dispenseId, body.status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
