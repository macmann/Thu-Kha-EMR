import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
let token: string;
let visitId: string;
let patientId: string;

beforeAll(async () => {
  const user = await prisma.user.create({ data: { email: 'meddoc@example.com', passwordHash: 'x', role: 'Doctor' } });
  token = jwt.sign({ role: 'Doctor' }, 'changeme', { subject: user.userId });
  const doctor = await prisma.doctor.create({ data: { name: 'Dr. M', department: 'Pharma' } });
  const patient = await prisma.patient.create({ data: { name: 'Med Pat', dob: new Date('1990-01-01'), gender: 'M' } });
  patientId = patient.patientId;
  const visit = await prisma.visit.create({ data: { patientId, doctorId: doctor.doctorId, visitDate: new Date('2023-02-01'), department: 'Pharma' } });
  visitId = visit.visitId;
});

afterAll(async () => {
  await prisma.medication.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Medications', () => {
  it('creates medication and lists', async () => {
    const createRes = await request(app)
      .post(`/api/visits/${visitId}/medications`)
      .set('Authorization', `Bearer ${token}`)
      .send({ drugName: 'Aspirin', dosage: '100mg' });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get(`/api/medications?patient_id=${patientId}&from=2022-01-01&to=2024-01-01`)
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body[0].drugName).toBe('Aspirin');
  });

  it('enforces role', async () => {
    const user = await prisma.user.create({ data: { email: 'audmed@example.com', passwordHash: 'x', role: 'Auditor' } });
    const auditorToken = jwt.sign({ role: 'Auditor' }, 'changeme', { subject: user.userId });
    const res = await request(app)
      .post(`/api/visits/${visitId}/medications`)
      .set('Authorization', `Bearer ${auditorToken}`)
      .send({ drugName: 'Ibuprofen' });
    expect(res.status).toBe(403);
  });
});
