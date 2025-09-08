import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './server';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
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
