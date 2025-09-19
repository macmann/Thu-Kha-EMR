import type { PrismaClient } from '@prisma/client';
import type { CreateAppointmentInput, UpdateAppointmentInput } from '../validation/appointment.js';
import { composeDateTime, dayOfWeekUTC, toDateOnly } from '../utils/time.js';

export type AvailabilityWindow = {
  startMin: number;
  endMin: number;
};

export async function getDoctorAvailabilityForDate(
  prisma: PrismaClient,
  doctorId: string,
  date: Date
): Promise<AvailabilityWindow[]> {
  const availability = await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek: dayOfWeekUTC(date),
    },
    select: {
      startMin: true,
      endMin: true,
    },
    orderBy: {
      startMin: 'asc',
    },
  });

  return availability;
}

export async function hasDoctorBlackout(
  prisma: PrismaClient,
  doctorId: string,
  date: Date,
  startMin: number,
  endMin: number
): Promise<boolean> {
  const startAt = composeDateTime(date, startMin);
  const endAt = composeDateTime(date, endMin);

  const blackout = await prisma.doctorBlackout.findFirst({
    where: {
      doctorId,
      startAt: {
        lt: endAt,
      },
      endAt: {
        gt: startAt,
      },
    },
    select: {
      blackoutId: true,
    },
  });

  return Boolean(blackout);
}

export async function hasDoctorOverlap(
  prisma: PrismaClient,
  doctorId: string,
  date: Date,
  startMin: number,
  endMin: number,
  excludeId?: string
): Promise<boolean> {
  const overlap = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date,
      status: {
        not: 'Cancelled',
      },
      startTimeMin: {
        lt: endMin,
      },
      endTimeMin: {
        gt: startMin,
      },
      ...(excludeId
        ? {
            appointmentId: {
              not: excludeId,
            },
          }
        : {}),
    },
    select: {
      appointmentId: true,
    },
  });

  return Boolean(overlap);
}

async function ensurePatientExists(prisma: PrismaClient, patientId: string): Promise<void> {
  const patient = await prisma.patient.findUnique({
    where: { patientId },
    select: { patientId: true },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }
}

async function ensureDoctorExists(prisma: PrismaClient, doctorId: string): Promise<void> {
  const doctor = await prisma.doctor.findUnique({
    where: { doctorId },
    select: { doctorId: true },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }
}

async function assertWithinAvailability(
  prisma: PrismaClient,
  doctorId: string,
  date: Date,
  startMin: number,
  endMin: number
): Promise<void> {
  const windows = await getDoctorAvailabilityForDate(prisma, doctorId, date);

  const fitsAvailability = windows.some((window) => startMin >= window.startMin && endMin <= window.endMin);

  if (!fitsAvailability) {
    throw new Error('Requested time is outside doctor availability');
  }
}

async function assertNoBlackout(
  prisma: PrismaClient,
  doctorId: string,
  date: Date,
  startMin: number,
  endMin: number
): Promise<void> {
  const hasBlackoutWindow = await hasDoctorBlackout(prisma, doctorId, date, startMin, endMin);

  if (hasBlackoutWindow) {
    throw new Error('Doctor is unavailable due to blackout');
  }
}

async function assertNoOverlap(
  prisma: PrismaClient,
  doctorId: string,
  date: Date,
  startMin: number,
  endMin: number,
  excludeId?: string
): Promise<void> {
  const overlapping = await hasDoctorOverlap(prisma, doctorId, date, startMin, endMin, excludeId);

  if (overlapping) {
    throw new Error('Appointment overlaps with an existing appointment');
  }
}

export async function assertCreatable(
  prisma: PrismaClient,
  dto: CreateAppointmentInput
): Promise<void> {
  const { patientId, doctorId, date: dateStr, startTimeMin, endTimeMin } = dto;
  const appointmentDate = toDateOnly(dateStr);

  await Promise.all([ensurePatientExists(prisma, patientId), ensureDoctorExists(prisma, doctorId)]);
  await assertWithinAvailability(prisma, doctorId, appointmentDate, startTimeMin, endTimeMin);
  await assertNoBlackout(prisma, doctorId, appointmentDate, startTimeMin, endTimeMin);
  await assertNoOverlap(prisma, doctorId, appointmentDate, startTimeMin, endTimeMin);
}

export async function assertUpdatable(
  prisma: PrismaClient,
  appointmentId: string,
  dto: UpdateAppointmentInput
): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { appointmentId },
    select: {
      appointmentId: true,
      patientId: true,
      doctorId: true,
      date: true,
      startTimeMin: true,
      endTimeMin: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const patientId = dto.patientId ?? appointment.patientId;
  const doctorId = dto.doctorId ?? appointment.doctorId;
  const appointmentDate = dto.date
    ? toDateOnly(dto.date)
    : toDateOnly(appointment.date.toISOString().slice(0, 10));
  const startMin = dto.startTimeMin ?? appointment.startTimeMin;
  const endMin = dto.endTimeMin ?? appointment.endTimeMin;

  await Promise.all([ensurePatientExists(prisma, patientId), ensureDoctorExists(prisma, doctorId)]);
  await assertWithinAvailability(prisma, doctorId, appointmentDate, startMin, endMin);
  await assertNoBlackout(prisma, doctorId, appointmentDate, startMin, endMin);
  await assertNoOverlap(prisma, doctorId, appointmentDate, startMin, endMin, appointmentId);
}
