import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let patientId: string;
let doctorId: string;
let visitId: string;

beforeAll(async () => {
  await prisma.user.create({ data: { email: 'visitdoc@example.com', passwordHash: 'x', role: 'Doctor' } });
  const doctor = await prisma.doctor.create({ data: { name: 'Dr. House', department: 'Diagnostics' } });
  doctorId = doctor.doctorId;
  const patient = await prisma.patient.create({ data: { name: 'Greg Patient', dob: new Date('1985-05-05'), gender: 'M' } });
  patientId = patient.patientId;
  // existing older visit for ordering
  await prisma.visit.create({ data: { patientId, doctorId, visitDate: new Date('2023-01-01'), department: 'Diagnostics', reason: 'old' } });
});

afterAll(async () => {
  await prisma.observation.deleteMany({});
  await prisma.labResult.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.diagnosis.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Visit lifecycle', () => {
  it('creates and retrieves visit details', async () => {
    const createRes = await request(app)
      .post('/api/visits')
      .send({
        patientId,
        visitDate: '2023-03-01',
        doctorId,
        department: 'Diagnostics',
        reason: 'checkup',
      });
    expect(createRes.status).toBe(201);
    visitId = createRes.body.visitId;

    await prisma.diagnosis.create({ data: { visitId, diagnosis: 'Flu' } });
    await prisma.medication.create({ data: { visitId, drugName: 'Tamiflu' } });
    await prisma.labResult.create({ data: { visitId, testName: 'CBC', resultValue: 4.5, unit: 'x', testDate: new Date('2023-03-02') } });
    await prisma.observation.create({ data: { visitId, patientId, doctorId, noteText: 'note1', createdAt: new Date('2023-03-02') } });
    await prisma.observation.create({ data: { visitId, patientId, doctorId, noteText: 'note2', createdAt: new Date('2023-03-03') } });

    const listRes = await request(app)
      .get(`/api/patients/${patientId}/visits`);
    expect(listRes.status).toBe(200);
    expect(listRes.body[0].visitId).toBe(visitId);

    const detailRes = await request(app)
      .get(`/api/visits/${visitId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.diagnoses[0].diagnosis).toBe('Flu');
    expect(detailRes.body.medications[0].drugName).toBe('Tamiflu');
    expect(detailRes.body.labResults[0].testName).toBe('CBC');
    expect(detailRes.body.observations[0].noteText).toBe('note2');
  });
});
