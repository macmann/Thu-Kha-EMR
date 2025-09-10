import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express';

export interface AuthUser {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

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

router.post('/login', (req: Request, res: Response) => {
  const { email } = req.body || {};
  const header = Buffer.from(
    JSON.stringify({ alg: 'none', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ sub: email || 'anonymous', role: 'Doctor' }),
  ).toString('base64url');
  const accessToken = `${header}.${payload}.`;
  res.json({ accessToken });
});

export default router;

