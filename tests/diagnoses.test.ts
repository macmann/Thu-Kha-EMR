import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
let token: string;
let visitId: string;
let patientId: string;

beforeAll(async () => {
  const user = await prisma.user.create({ data: { email: 'diagdoc@example.com', passwordHash: 'x', role: 'Doctor' } });
  token = jwt.sign({ role: 'Doctor' }, 'changeme', { subject: user.userId });
  const doctor = await prisma.doctor.create({ data: { name: 'Dr. D', department: 'General' } });
  const patient = await prisma.patient.create({ data: { name: 'Diag Pat', dob: new Date('1990-01-01'), gender: 'F' } });
  patientId = patient.patientId;
  const visit = await prisma.visit.create({ data: { patientId, doctorId: doctor.doctorId, visitDate: new Date('2023-01-01'), department: 'General' } });
  visitId = visit.visitId;
});

afterAll(async () => {
  await prisma.diagnosis.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Diagnoses', () => {
  it('creates diagnosis and lists', async () => {
    const createRes = await request(app)
      .post(`/api/visits/${visitId}/diagnoses`)
      .set('Authorization', `Bearer ${token}`)
      .send({ diagnosis: 'Flu' });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/diagnoses?q=Flu&from=2022-01-01&to=2024-01-01')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body[0].diagnosis).toBe('Flu');
  });

  it('forbids non doctor/admin', async () => {
    const user = await prisma.user.create({ data: { email: 'auditorDiag@example.com', passwordHash: 'x', role: 'Auditor' } });
    const auditorToken = jwt.sign({ role: 'Auditor' }, 'changeme', { subject: user.userId });
    const res = await request(app)
      .post(`/api/visits/${visitId}/diagnoses`)
      .set('Authorization', `Bearer ${auditorToken}`)
      .send({ diagnosis: 'Cold' });
    expect(res.status).toBe(403);
  });
});
