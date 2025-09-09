import request from 'supertest';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/index';

const prisma = new PrismaClient();
let doctorUserId: string;
let doctorToken: string;
let refreshCookie: string;
let patientId: string;
let visitId: string;
let priorVisitId: string;

beforeAll(async () => {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`;
  // seed root admin and patient
  const hash = await bcrypt.hash('rootpass', 10);
  await prisma.user.create({ data: { email: 'root@example.com', passwordHash: hash, role: 'Admin' } });
  const patient = await prisma.patient.create({
    data: { name: 'John Doe', dob: new Date('1980-01-01'), gender: 'M', contact: '5551234', insurance: 'Aetna' },
  });
  patientId = patient.patientId;
});

afterAll(async () => {
  await prisma.observation.deleteMany({});
  await prisma.labResult.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.diagnosis.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('E2E flows', () => {
  it('auth flow register/login/refresh/logout', async () => {
    // login as root admin
    const rootLogin = await request(app).post('/api/auth/login').send({ email: 'root@example.com', password: 'rootpass' });
    expect(rootLogin.status).toBe(200);
    const rootToken = rootLogin.body.accessToken;

    // register another admin
    const regAdmin = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${rootToken}`)
      .send({ email: 'admin2@example.com', password: 'adminpass2', role: 'Admin' });
    expect(regAdmin.status).toBe(201);

    // register doctor
    const regDoc = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${rootToken}`)
      .send({ email: 'doc@example.com', password: 'docpass', role: 'Doctor' });
    expect(regDoc.status).toBe(201);
    doctorUserId = regDoc.body.userId;

    // create doctor record for visits
    await prisma.doctor.create({ data: { doctorId: doctorUserId, name: 'Dr. House', department: 'Diagnostics' } });

    // login as doctor
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'doc@example.com', password: 'docpass' });
    expect(loginRes.status).toBe(200);
    doctorToken = loginRes.body.accessToken;
    refreshCookie = loginRes.headers['set-cookie'].find((c: string) => c.startsWith('refresh='));

    // refresh token
    const refreshRes = await request(app).post('/api/auth/token/refresh').set('Cookie', refreshCookie);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    refreshCookie = refreshRes.headers['set-cookie'].find((c: string) => c.startsWith('refresh='));

    // logout
    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', refreshCookie);
    expect(logoutRes.status).toBe(204);

    // login again for later tests
    const loginRes2 = await request(app).post('/api/auth/login').send({ email: 'doc@example.com', password: 'docpass' });
    doctorToken = loginRes2.body.accessToken;
    refreshCookie = loginRes2.headers['set-cookie'].find((c: string) => c.startsWith('refresh='));

    // create prior visit and observation for later tests
    const priorVisit = await prisma.visit.create({
      data: {
        patientId,
        doctorId: doctorUserId,
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        department: 'General',
        reason: 'checkup',
      },
    });
    priorVisitId = priorVisit.visitId;
    await prisma.observation.create({
      data: {
        visitId: priorVisitId,
        patientId,
        doctorId: doctorUserId,
        noteText: 'previous obs',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 89),
      },
    });
  });

  it('patients fuzzy search', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .query({ query: 'Jon Doe' });
    expect(res.status).toBe(200);
    const names = res.body.map((p: any) => p.name);
    expect(names).toContain('John Doe');
  });

  it('create visit with data and summary', async () => {
    const visitRes = await request(app)
      .post('/api/visits')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId,
        doctorId: doctorUserId,
        visitDate: new Date().toISOString(),
        department: 'Endocrinology',
        reason: 'follow-up',
      });
    expect(visitRes.status).toBe(201);
    visitId = visitRes.body.visitId;

    const diagRes = await request(app)
      .post(`/api/visits/${visitId}/diagnoses`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ diagnosis: 'Diabetes' });
    expect(diagRes.status).toBe(201);

    const medRes = await request(app)
      .post(`/api/visits/${visitId}/medications`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ drugName: 'Metformin', dosage: '500mg' });
    expect(medRes.status).toBe(201);

    const labRes = await request(app)
      .post(`/api/visits/${visitId}/labs`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ testName: 'HbA1c', resultValue: 9.1, unit: '%', testDate: new Date().toISOString() });
    expect(labRes.status).toBe(201);

    const obsRes = await request(app)
      .post(`/api/visits/${visitId}/observations`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ noteText: 'current obs' });
    expect(obsRes.status).toBe(201);

    const summaryRes = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .query({ include: 'summary' });
    expect(summaryRes.status).toBe(200);
    const v = summaryRes.body.visits.find((x: any) => x.visitId === visitId);
    expect(v.diagnoses.length).toBe(1);
    expect(v.medications.length).toBe(1);
    expect(v.labResults.length).toBe(1);
    expect(v.observations.length).toBe(1);
  });

  it('observations complex query', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}/observations`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .query({ author: 'me', before_visit: visitId });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].noteText).toBe('previous obs');
  });

  it('HbA1c cohort >8 in 6 months', async () => {
    const res = await request(app)
      .get('/api/insights/cohort')
      .set('Authorization', `Bearer ${doctorToken}`)
      .query({ test_name: 'HbA1c', op: 'gt', value: 8, months: 6 });
    expect(res.status).toBe(200);
    const ids = res.body.map((c: any) => c.patientId);
    expect(ids).toContain(patientId);
  });
});
