import { Router, type Response, type NextFunction } from 'express';
import type { Request } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

type RoleName =
  | 'Doctor'
  | 'AdminAssistant'
  | 'ITAdmin'
  | 'Pharmacist'
  | 'PharmacyTech'
  | 'InventoryManager';

export interface AuthUser {
  userId: string;
  role: RoleName;
  email: string;
  doctorId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const prisma = new PrismaClient();

function parseBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return null;
  return value?.trim() || null;
}

function decodeToken(token: string): {
  sub?: string;
  role?: unknown;
  email?: unknown;
  doctorId?: unknown;
} {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid token');
  }
  const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
  return JSON.parse(payload);
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const rawToken = parseBearerToken(req.get('authorization'));
    if (!rawToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = decodeToken(rawToken);
    if (typeof payload.sub !== 'string' || typeof payload.role !== 'string' || typeof payload.email !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { userId: payload.sub },
      select: { userId: true, email: true, role: true, status: true, doctorId: true },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      userId: user.userId,
      role: user.role as RoleName,
      email: user.email,
      doctorId: user.doctorId ?? undefined,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(...roles: RoleName[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role === 'ITAdmin') {
      return next();
    }

    if (roles.length === 0 || roles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
  };
}

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const body = req.body as { email?: unknown; password?: unknown } | undefined;
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail || password.trim().length === 0) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: normalizedEmail, mode: 'insensitive' },
    },
  });

  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let passwordValid = false;
  try {
    passwordValid = await bcrypt.compare(password, user.passwordHash);
  } catch {
    passwordValid = false;
  }

  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const header = Buffer.from(
    JSON.stringify({ alg: 'none', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.userId,
      role: user.role,
      email: user.email,
      doctorId: user.doctorId ?? null,
    }),
  ).toString('base64url');
  const accessToken = `${header}.${payload}.`;
  res.json({
    accessToken,
    user: {
      userId: user.userId,
      role: user.role,
      email: user.email,
      doctorId: user.doctorId,
    },
  });
});

export default router;

