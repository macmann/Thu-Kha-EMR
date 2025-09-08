import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../auth';

const prisma = new PrismaClient();
const router = Router();

const querySchema = z.object({
  department: z.string().optional(),
  q: z.string().optional(),
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query' });
  }
  const { department, q } = parsed.data;
  if (!department && !q) {
    return res.status(400).json({ error: 'department or q required' });
  }
  const where: any = {};
  if (department) {
    where.department = { contains: department, mode: 'insensitive' };
  }
  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }
  const doctors = await prisma.doctor.findMany({ where, orderBy: { name: 'asc' } });
  res.json(doctors);
});

export default router;
