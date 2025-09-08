import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpErrors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';

  res.status(status).json({ error: { message } });
}
