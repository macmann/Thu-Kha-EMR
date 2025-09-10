import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.doctor.deleteMany({});
});

afterAll(async () => {
  await prisma.doctor.deleteMany({});
  await prisma.$disconnect();
});

describe('Doctor management', () => {
  it('creates and lists doctors', async () => {
    const createRes = await request(app)
      .post('/api/doctors')
      .send({ name: 'Dr. Test', department: 'Testing' });
    expect(createRes.status).toBe(201);
    const id = createRes.body.doctorId;
    expect(id).toBeDefined();

    const listRes = await request(app).get('/api/doctors');
    expect(listRes.status).toBe(200);
    const ids = listRes.body.map((d: any) => d.doctorId);
    expect(ids).toContain(id);
  });
});

