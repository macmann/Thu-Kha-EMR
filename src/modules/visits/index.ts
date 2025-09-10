import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole, type AuthRequest } from '../auth/index.js';
import { logDataChange } from '../audit/index.js';

const prisma = new PrismaClient();
const router = Router();

const visitSchema = z.object({
  patientId: z.string().uuid(),
  visitDate: z.coerce.date(),
  doctorId: z.string().uuid(),
  department: z.string(),
  reason: z.string().optional(),
});

router.post('/visits', requireAuth, requireRole('Doctor', 'Admin'), async (req: AuthRequest, res: Response) => {
  const parsed = visitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const visit = await prisma.visit.create({
    data: parsed.data,
    include: {
      doctor: { select: { doctorId: true, name: true, department: true } },
      diagnoses: { orderBy: { createdAt: 'desc' } },
      medications: { orderBy: { createdAt: 'desc' } },
      labResults: { orderBy: { createdAt: 'desc' } },
      observations: { orderBy: { createdAt: 'desc' } },
    },
  });
  await logDataChange(req.user!.userId, 'visit', visit.visitId, undefined, visit);
  res.status(201).json(visit);
});

router.get('/patients/:id/visits', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    z.string().uuid().parse(id);
  } catch {
    return res.status(400).json({ error: 'invalid id' });
  }
  const visits = await prisma.visit.findMany({
    where: { patientId: id },
    orderBy: { visitDate: 'desc' },
    include: { doctor: { select: { doctorId: true, name: true, department: true } } },
  });
  res.json(visits);
});

router.get('/visits/:id', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    z.string().uuid().parse(id);
  } catch {
    return res.status(400).json({ error: 'invalid id' });
  }
  const visit = await prisma.visit.findUnique({
    where: { visitId: id },
    include: {
      doctor: { select: { doctorId: true, name: true, department: true } },
      diagnoses: { orderBy: { createdAt: 'desc' } },
      medications: { orderBy: { createdAt: 'desc' } },
      labResults: { orderBy: { createdAt: 'desc' } },
      observations: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!visit) return res.sendStatus(404);
  res.json(visit);
});

export default router;
