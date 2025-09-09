import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { requireAuth, requireRole } from './middleware.js';
import type { AuthRequest } from './middleware.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ACCESS_TTL = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || '15'); // minutes
const REFRESH_TTL = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7'); // days

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MIN || '1') * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
});

const router = Router();
router.use(limiter);

function signAccessToken(user: { userId: string; role: string }) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    expiresIn: `${ACCESS_TTL}m`,
    subject: user.userId,
  });
}

function signRefreshToken(sessionId: string, userId: string) {
  return jwt.sign({ sessionId }, JWT_SECRET, {
    expiresIn: `${REFRESH_TTL}d`,
    subject: userId,
  });
}

async function logEvent(userId: string | null, event: string, outcome: string, meta?: any) {
  try {
    await prisma.authAudit.create({
      data: {
        userId: userId || undefined,
        event,
        outcome,
        meta,
      },
    });
  } catch (err) {
    // swallow logging errors
  }
}

// Parse cookies without cookie-parser
function getCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const pairs = header.split(';').map((c: string) => c.trim().split('='));
  const cookies: Record<string, string> = {};
  for (const [k, v] of pairs) {
    cookies[k] = decodeURIComponent(v);
  }
  return cookies;
}

// Password reset token store
interface ResetEntry { userId: string; expires: number; }
const resetTokens = new Map<string, ResetEntry>();

router.post('/register', requireAuth, requireRole('Admin'), async (req: AuthRequest, res: Response) => {
  const { email, password, role } = req.body as { email: string; password: string; role: Role };
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, role },
    });
    return res.status(201).json({ userId: user.userId, email: user.email, role: user.role });
  } catch (err) {
    return res.status(400).json({ error: 'User exists' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await logEvent(null, 'login_failed', 'user_not_found', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await logEvent(user.userId, 'login_failed', 'bad_password');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const sessionId = crypto.randomUUID();
  const refreshToken = signRefreshToken(sessionId, user.userId);
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  const now = new Date();
  await prisma.session.create({
    data: {
      sessionId,
      userId: user.userId,
      refreshTokenHash: refreshHash,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + REFRESH_TTL * 24 * 60 * 60 * 1000),
      ip: req.ip,
      ua: req.get('user-agent') || undefined,
    },
  });
  const accessToken = signAccessToken({ userId: user.userId, role: user.role });
  res.cookie('refresh', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth',
  });
  await logEvent(user.userId, 'login_success', 'success');
  return res.json({ accessToken });
});

router.post('/token/refresh', async (req: Request, res: Response) => {
  const cookies = getCookies(req);
  const token = cookies['refresh'];
  if (!token) return res.sendStatus(401);
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return res.sendStatus(401);
  }
  const session = await prisma.session.findUnique({ where: { sessionId: payload.sessionId } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return res.sendStatus(401);
  }
  const valid = await bcrypt.compare(token, session.refreshTokenHash);
  if (!valid) {
    return res.sendStatus(401);
  }
  // rotate
  await prisma.session.update({ where: { sessionId: session.sessionId }, data: { revokedAt: new Date() } });
  const newSessionId = crypto.randomUUID();
  const newRefresh = signRefreshToken(newSessionId, session.userId);
  const newHash = await bcrypt.hash(newRefresh, 10);
  const now = new Date();
  await prisma.session.create({
    data: {
      sessionId: newSessionId,
      userId: session.userId,
      refreshTokenHash: newHash,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + REFRESH_TTL * 24 * 60 * 60 * 1000),
      ip: req.ip,
      ua: req.get('user-agent') || undefined,
    },
  });
  const user = await prisma.user.findUnique({ where: { userId: session.userId } });
  const accessToken = signAccessToken({ userId: session.userId, role: user?.role || '' });
  res.cookie('refresh', newRefresh, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth',
  });
  await logEvent(session.userId, 'refresh', 'success');
  return res.json({ accessToken });
});

router.post('/logout', async (req: Request, res: Response) => {
  const cookies = getCookies(req);
  const token = cookies['refresh'];
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      await prisma.session.update({ where: { sessionId: payload.sessionId }, data: { revokedAt: new Date() } });
    } catch (err) {
      // ignore
    }
  }
  res.clearCookie('refresh', { path: '/api/auth' });
  await logEvent(null, 'logout', 'success');
  res.status(204).end();
});

router.post('/password/forgot', async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomUUID();
    resetTokens.set(token, { userId: user.userId, expires: Date.now() + 60 * 60 * 1000 });
    // In real app, send email containing token
  }
  await logEvent(user ? user.userId : null, 'reset_request', 'requested', { email });
  res.json({ ok: true });
});

router.post('/password/reset', async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  const entry = resetTokens.get(token);
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { userId: entry.userId }, data: { passwordHash: hash } });
  resetTokens.delete(token);
  await logEvent(entry.userId, 'password_reset', 'success');
  res.json({ ok: true });
});

export { requireAuth, requireRole } from './middleware.js';
export default router;
