import request from 'supertest';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { app } from '../src/index';

const prisma = new PrismaClient();

describe('POST /api/auth/login', () => {
  const email = 'loginuser@example.com';
  const password = 'SecurePass123!';

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, passwordHash, role: 'Doctor', status: 'active' },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('rejects empty credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('issues an access token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    const segments = res.body.accessToken.split('.');
    expect(segments).toHaveLength(3);
    expect(segments[0].length).toBeGreaterThan(0);
    expect(segments[1].length).toBeGreaterThan(0);
  });
});
