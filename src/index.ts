import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './server';
import { errorHandler } from './middleware/errorHandler';

if (
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('sslmode=require')
) {
  throw new Error('sslmode=require must be set in DATABASE_URL');
}

export const app = express();
app.disable('x-powered-by');
app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

// Error handler should be last and only apply to /api routes
app.use('/api', errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
