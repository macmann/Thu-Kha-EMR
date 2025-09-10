import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../auth/index.js';
import { validate } from '../../middleware/validate.js';

const prisma = new PrismaClient();
const router = Router();

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MIN || '1') * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
});

function maskContact(contact?: string | null) {
  if (!contact) return contact;
  return contact.replace(/.(?=.{2})/g, '*');
}

router.get(
  '/',
  requireAuth,
  limiter,
  validate({
    query: z.object({
      query: z.string().min(1),
      limit: z.string().optional(),
      offset: z.string().optional(),
    }),
  }),
  async (req: Request, res: Response) => {
    const q = req.query.query as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;
    const lowerQ = q.toLowerCase();
  const patients = await prisma.$queryRaw<Array<{ patientId: string; name: string; dob: Date; insurance: string | null }>>(
    Prisma.sql`
      SELECT "patientId", name, dob, insurance
      FROM "Patient"
      WHERE lower(name) % ${lowerQ}
      ORDER BY similarity(lower(name), ${lowerQ}) DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  );
  console.log('patient search', { q, count: patients.length });
    res.json(patients);
  }
);

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const include = req.query.include === 'summary';
  const select: any = {
    patientId: true,
    name: true,
    dob: true,
    gender: true,
    contact: true,
    insurance: true,
  };
  if (include) {
    select.visits = {
      orderBy: { visitDate: 'desc' },
      take: 3,
      select: {
        visitId: true,
        visitDate: true,
        doctor: { select: { doctorId: true, name: true, department: true } },
        diagnoses: { select: { diagnosis: true } },
        medications: { select: { drugName: true, dosage: true, instructions: true } },
        labResults: {
          where: { testName: { in: ['HbA1c', 'LDL'] } },
          select: { testName: true, resultValue: true, unit: true, testDate: true },
        },
        observations: {
          orderBy: { createdAt: 'desc' },
          take: 2,
          select: {
            obsId: true,
            noteText: true,
            bpSystolic: true,
            bpDiastolic: true,
            heartRate: true,
            temperatureC: true,
            spo2: true,
            bmi: true,
            createdAt: true,
          },
        },
      },
    };
  }
  const patient = await prisma.patient.findUnique({ where: { patientId: id }, select });
  if (!patient) {
    return res.sendStatus(404);
  }
  console.log('patient detail', { patientId: id, contact: maskContact(patient.contact as unknown as string | null) });
  res.json(patient);
});

export default router;
