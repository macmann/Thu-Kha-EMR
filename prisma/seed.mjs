import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

function loadCsv(path) {
  const buf = fs.readFileSync(path);
  return parse(buf, { columns: true, skip_empty_lines: true, trim: true });
}
function d(s) { return s ? new Date(`${s}T00:00:00Z`) : null; }

async function seedUsers() {
  const adminEmail = 'admin@example.com';
  const doctorEmail = 'drsmith@example.com';

  const adminHash = await bcrypt.hash('AdminPass123!', 10);
  const doctorHash = await bcrypt.hash('DoctorPass123!', 10);

  // Avoid upsert prepared-statement issues: find → update/create
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    await prisma.user.update({ where: { email: adminEmail }, data: { passwordHash: adminHash, role: 'Admin', status: 'active' } });
  } else {
    await prisma.user.create({ data: { email: adminEmail, passwordHash: adminHash, role: 'Admin', status: 'active' } });
  }

  const doc = await prisma.user.findUnique({ where: { email: doctorEmail } });
  if (doc) {
    await prisma.user.update({ where: { email: doctorEmail }, data: { passwordHash: doctorHash, role: 'Doctor', status: 'active' } });
  } else {
    await prisma.user.create({ data: { email: doctorEmail, passwordHash: doctorHash, role: 'Doctor', status: 'active' } });
  }

  console.log('✅ Users seeded');
}

async function seedDoctors() {
  const rows = loadCsv('./prisma/data/doctors.csv');
  // expected headers: doctorId,name,department
  const map = new Map(); // doctorId -> true
  for (const r of rows) {
    const doctorId = r.doctorId;
    if (!doctorId) {
      console.warn('⚠️ Skipping doctor without doctorId:', r);
      continue;
    }
    await prisma.doctor.upsert({
      where: { doctorId },
      update: { name: r.name, department: r.department },
      create: { doctorId, name: r.name, department: r.department },
    });
    map.set(doctorId, true);
  }
  console.log(`✅ ${rows.length} doctors seeded`);
  return map;
}

async function seedPatients() {
  const rows = loadCsv('./prisma/data/patients.csv');
  // expected headers: patientId,name,dob,gender,contact,insurance
  const map = new Map(); // patientId -> true
  for (const r of rows) {
    const patientId = r.patientId;
    if (!patientId) {
      console.warn('⚠️ Skipping patient without patientId:', r);
      continue;
    }
    await prisma.patient.upsert({
      where: { patientId },
      update: {
        name: r.name, dob: d(r.dob), gender: r.gender || null,
        contact: r.contact || null, insurance: r.insurance || null,
      },
      create: {
        patientId,
        name: r.name, dob: d(r.dob), gender: r.gender || null,
        contact: r.contact || null, insurance: r.insurance || null,
      },
    });
    map.set(patientId, true);
  }
  console.log(`✅ ${rows.length} patients seeded`);
  return map;
}

async function seedVisits(doctorMap, patientMap) {
  const rows = loadCsv('./prisma/data/visits.csv');
  // expected headers: visitId,patientId,doctorId,visitDate,department,reason
  let created = 0, skipped = 0;
  for (const r of rows) {
    const { visitId, patientId, doctorId } = r;
    if (!visitId || !patientId || !doctorId) {
      console.warn('⚠️ Skipping visit missing IDs:', r);
      skipped++; continue;
    }
    if (!doctorMap.has(doctorId)) {
      console.error('❌ Missing doctor for visit, doctorId=', doctorId, ' row=', r);
      skipped++; continue;
    }
    if (!patientMap.has(patientId)) {
      console.error('❌ Missing patient for visit, patientId=', patientId, ' row=', r);
      skipped++; continue;
    }
    try {
      await prisma.visit.upsert({
        where: { visitId },
        update: {
          patientId, doctorId, visitDate: d(r.visitDate),
          department: r.department || null, reason: r.reason || null,
        },
        create: {
          visitId, patientId, doctorId, visitDate: d(r.visitDate),
          department: r.department || null, reason: r.reason || null,
        },
      });
      created++;
    } catch (e) {
      console.error('❌ Visit upsert failed for', visitId, e.message);
      throw e;
    }
  }
  console.log(`✅ ${created} visits seeded, ${skipped} skipped`);
}

async function seedDiagnoses() {
  const rows = loadCsv('./prisma/data/diagnoses.csv');
  // expected: diagId,visitId,diagnosis
  for (const r of rows) {
    await prisma.diagnosis.upsert({
      where: { diagId: r.diagId },
      update: { visitId: r.visitId, diagnosis: r.diagnosis },
      create: { diagId: r.diagId, visitId: r.visitId, diagnosis: r.diagnosis },
    });
  }
  console.log(`✅ ${rows.length} diagnoses seeded`);
}

async function seedMedications() {
  const rows = loadCsv('./prisma/data/medications.csv');
  // expected: medId,visitId,drugName,dosage,instructions
  for (const r of rows) {
    await prisma.medication.upsert({
      where: { medId: r.medId },
      update: { visitId: r.visitId, drugName: r.drugName, dosage: r.dosage || null, instructions: r.instructions || null },
      create: { medId: r.medId, visitId: r.visitId, drugName: r.drugName, dosage: r.dosage || null, instructions: r.instructions || null },
    });
  }
  console.log(`✅ ${rows.length} medications seeded`);
}

async function seedLabs() {
  const rows = loadCsv('./prisma/data/lab_results.csv');
  // expected: labId,visitId,testName,resultValue,unit,referenceRange,testDate
  for (const r of rows) {
    await prisma.labResult.upsert({
      where: { labId: r.labId },
      update: {
        visitId: r.visitId, testName: r.testName,
        resultValue: r.resultValue ? parseFloat(r.resultValue) : null,
        unit: r.unit || null, referenceRange: r.referenceRange || null, testDate: d(r.testDate),
      },
      create: {
        labId: r.labId, visitId: r.visitId, testName: r.testName,
        resultValue: r.resultValue ? parseFloat(r.resultValue) : null,
        unit: r.unit || null, referenceRange: r.referenceRange || null, testDate: d(r.testDate),
      },
    });
  }
  console.log(`✅ ${rows.length} lab results seeded`);
}

async function seedObservations() {
  const rows = loadCsv('./prisma/data/reports.csv');
  // expected: obsId,visitId,patientId,doctorId,noteText,bpSystolic,bpDiastolic,heartRate,temperatureC,spo2,bmi,createdAt
  for (const r of rows) {
    await prisma.observation.upsert({
      where: { obsId: r.obsId },
      update: {
        visitId: r.visitId, patientId: r.patientId, doctorId: r.doctorId,
        noteText: r.noteText || '',
        bpSystolic: r.bpSystolic ? parseInt(r.bpSystolic, 10) : null,
        bpDiastolic: r.bpDiastolic ? parseInt(r.bpDiastolic, 10) : null,
        heartRate: r.heartRate ? parseInt(r.heartRate, 10) : null,
        temperatureC: r.temperatureC ? parseFloat(r.temperatureC) : null,
        spo2: r.spo2 ? parseInt(r.spo2, 10) : null,
        bmi: r.bmi ? parseFloat(r.bmi) : null,
        createdAt: d(r.createdAt),
      },
      create: {
        obsId: r.obsId,
        visitId: r.visitId, patientId: r.patientId, doctorId: r.doctorId,
        noteText: r.noteText || '',
        bpSystolic: r.bpSystolic ? parseInt(r.bpSystolic, 10) : null,
        bpDiastolic: r.bpDiastolic ? parseInt(r.bpDiastolic, 10) : null,
        heartRate: r.heartRate ? parseInt(r.heartRate, 10) : null,
        temperatureC: r.temperatureC ? parseFloat(r.temperatureC) : null,
        spo2: r.spo2 ? parseInt(r.spo2, 10) : null,
        bmi: r.bmi ? parseFloat(r.bmi) : null,
        createdAt: d(r.createdAt),
      },
    });
  }
  console.log(`✅ ${rows.length} observations seeded`);
}

async function main() {
  await seedUsers();

  // ORDER MATTERS
  const doctorMap  = await seedDoctors();
  const patientMap = await seedPatients();
  await seedVisits(doctorMap, patientMap);

  await seedDiagnoses();
  await seedMedications();
  await seedLabs();
  await seedObservations();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
