import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    session: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    authAudit: { create: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([]),
    patient: { findUnique: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mPrisma), Prisma: { sql: () => '' } };
});

describe('security headers and rate limits', () => {
  let app: any;

  beforeEach(async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'changeme';
    process.env.RATE_LIMIT_MAX = '2';
    process.env.RATE_LIMIT_WINDOW_MIN = '1';
    const mod = await import('../src/index');
    app = mod.app;
  });

  it('disables x-powered-by and sets helmet headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rate limits auth routes', async () => {
    await request(app).post('/api/auth/login').send({ email: 'a', password: 'b' });
    await request(app).post('/api/auth/login').send({ email: 'a', password: 'b' });
    const res = await request(app).post('/api/auth/login').send({ email: 'a', password: 'b' });
    expect(res.status).toBe(429);
  });

  it('rate limits patient search', async () => {
    const token = jwt.sign({ role: 'Doctor' }, 'changeme', { subject: 'u1' });
    await request(app).get('/api/patients').set('Authorization', `Bearer ${token}`).query({ query: 'a' });
    await request(app).get('/api/patients').set('Authorization', `Bearer ${token}`).query({ query: 'a' });
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .query({ query: 'a' });
    expect(res.status).toBe(429);
  });
});

describe('CORS in production', () => {
  it('disables cors in production', async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'changeme';
    const mod = await import('../src/index');
    const res = await request(mod.app).get('/api/health');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
