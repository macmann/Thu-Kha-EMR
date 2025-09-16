import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export interface AuthUser {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const prisma = new PrismaClient();

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  // Authentication disabled; attach anonymous user
  req.user = { userId: 'anonymous', role: 'Anonymous' };
  next();
}

export function requireRole(..._roles: string[]) {
  return (_req: AuthRequest, _res: Response, next: NextFunction) => {
    // Authorization disabled
    next();
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
    JSON.stringify({ sub: user.userId, role: user.role, email: user.email }),
  ).toString('base64url');
  const accessToken = `${header}.${payload}.`;
  res.json({ accessToken });
});

export default router;

