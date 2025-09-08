import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
let token: string;
let patientId: string;
let doctorId: string;
let visit1Id: string;
let visit2Id: string;

afterAll(async () => {
  await prisma.observation.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Observations', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({ data: { email: 'obsdoc@example.com', passwordHash: 'x', role: 'Doctor' } });
    token = jwt.sign({ role: 'Doctor' }, 'changeme', { subject: user.userId });
    const doctor = await prisma.doctor.create({ data: { doctorId: user.userId, name: 'Dr. Obs', department: 'General' } });
    doctorId = doctor.doctorId;
    const patient = await prisma.patient.create({ data: { name: 'Obs Pat', dob: new Date('1990-01-01'), gender: 'F' } });
    patientId = patient.patientId;
    const v1 = await prisma.visit.create({ data: { patientId, doctorId, visitDate: new Date('2023-01-01'), department: 'Gen' } });
    visit1Id = v1.visitId;
    const v2 = await prisma.visit.create({ data: { patientId, doctorId, visitDate: new Date('2023-02-01'), department: 'Gen' } });
    visit2Id = v2.visitId;
    await prisma.observation.create({ data: { visitId: visit1Id, patientId, doctorId, noteText: 'first', createdAt: new Date('2023-01-02') } });
  });

  it('creates observation via API', async () => {
    const res = await request(app)
      .post(`/api/visits/${visit2Id}/observations`)
      .set('Authorization', `Bearer ${token}`)
      .send({ noteText: 'second', bpSystolic: 120 });
    expect(res.status).toBe(201);
    expect(res.body.patientId).toBe(patientId);
    expect(res.body.doctorId).toBe(doctorId);
  });

  it('filters by author=me and before current visit', async () => {
    const res = await request(app)
      .get(`/api/visits/${visit2Id}/observations`)
      .query({ scope: 'patient', author: 'me', before: 'visit' })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].noteText).toBe('first');
  });

  it('supports patient observations endpoint', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}/observations`)
      .query({ author: 'me', before_visit: visit2Id })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].noteText).toBe('first');
  });

  it('rejects non-doctor on create', async () => {
    const user = await prisma.user.create({ data: { email: 'auditorObs@example.com', passwordHash: 'x', role: 'Auditor' } });
    const auditorToken = jwt.sign({ role: 'Auditor' }, 'changeme', { subject: user.userId });
    const res = await request(app)
      .post(`/api/visits/${visit2Id}/observations`)
      .set('Authorization', `Bearer ${auditorToken}`)
      .send({ noteText: 'bad' });
    expect(res.status).toBe(403);
  });
});
