import { Router, type Request, type Response, type NextFunction } from 'express';

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

// No authentication routes are exposed
const router = Router();

export default router;

