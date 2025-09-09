import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

function loadCsv(path) {
  const file = fs.readFileSync(path);
  return parse(file, {
    columns: true,
    skip_empty_lines: true
  });
}

async function main() {
  // --- Seed default users ---
  const adminPass = await bcrypt.hash('AdminPass123!', 10);
  const doctorPass = await bcrypt.hash('DoctorPass123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPass,
      role: 'Admin',
      status: 'active'
    }
  });

  await prisma.user.upsert({
    where: { email: 'drsmith@example.com' },
    update: {},
    create: {
      email: 'drsmith@example.com',
      passwordHash: doctorPass,
      role: 'Doctor',
      status: 'active'
    }
  });

  console.log('✅ Users seeded');

  // --- Seed Patients ---
  const patients = loadCsv('./prisma/data/patients.csv');
  for (const p of patients) {
    await prisma.patient.upsert({
      where: { patientId: p.patientId },
      update: {},
      create: {
        patientId: p.patientId,
        name: p.name,
        dob: new Date(p.dob),
        gender: p.gender,
        contact: p.contact || null,
        insurance: p.insurance || null
      }
    });
  }
  console.log(`✅ ${patients.length} patients seeded`);

  // --- Seed Visits ---
  const visits = loadCsv('./prisma/data/visits.csv');
  for (const v of visits) {
    await prisma.visit.create({
      data: {
        visitId: v.visitId,
        patientId: v.patientId,
        doctorId: v.doctorId,
        visitDate: new Date(v.visitDate),
        department: v.department,
        reason: v.reason
      }
    });
  }
  console.log(`✅ ${visits.length} visits seeded`);

  // --- Seed Diagnoses ---
  const diagnoses = loadCsv('./prisma/data/diagnoses.csv');
  for (const d of diagnoses) {
    await prisma.diagnosis.create({
      data: {
        diagId: d.diagId,
        visitId: d.visitId,
        diagnosis: d.diagnosis
      }
    });
  }
  console.log(`✅ ${diagnoses.length} diagnoses seeded`);

  // --- Seed Medications ---
  const medications = loadCsv('./prisma/data/medications.csv');
  for (const m of medications) {
    await prisma.medication.create({
      data: {
        medId: m.medId,
        visitId: m.visitId,
        drugName: m.drugName,
        dosage: m.dosage,
        instructions: m.instructions
      }
    });
  }
  console.log(`✅ ${medications.length} medications seeded`);

  // --- Seed Lab Results ---
  const labs = loadCsv('./prisma/data/lab_results.csv');
  for (const l of labs) {
    await prisma.labResult.create({
      data: {
        labId: l.labId,
        visitId: l.visitId,
        testName: l.testName,
        resultValue: l.resultValue ? parseFloat(l.resultValue) : null,
        unit: l.unit,
        referenceRange: l.referenceRange,
        testDate: l.testDate ? new Date(l.testDate) : null
      }
    });
  }
  console.log(`✅ ${labs.length} lab results seeded`);

  // --- Seed Reports (if you want as unstructured data) ---
  const reports = loadCsv('./prisma/data/reports.csv');
  for (const r of reports) {
    await prisma.observation.create({
      data: {
        obsId: r.obsId,
        visitId: r.visitId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        noteText: r.noteText
      }
    });
  }
  console.log(`✅ ${reports.length} reports (observations) seeded`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
