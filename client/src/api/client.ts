import { fetchJSON } from './http';

export type Role =
  | 'Doctor'
  | 'AdminAssistant'
  | 'ITAdmin'
  | 'Pharmacist'
  | 'PharmacyTech'
  | 'InventoryManager';

export interface Patient {
  patientId: string;
  name: string;
  dob: string;
  insurance: string | null;
  gender?: string | null;
  contact?: string | null;
}

export interface Doctor {
  doctorId: string;
  name: string;
  department: string;
}

export interface DoctorAvailabilitySlot {
  availabilityId: string;
  doctorId: string;
  dayOfWeek: number;
  startMin: number;
  endMin: number;
}

export interface DoctorAvailabilityResponse {
  doctorId: string;
  availability: DoctorAvailabilitySlot[];
  defaultAvailability: { startMin: number; endMin: number }[];
}

export interface Diagnosis {
  diagnosis: string;
}

export interface Medication {
  drugName: string;
  dosage?: string;
  instructions?: string;
}

export interface LabResult {
  testName: string;
  resultValue: number | null;
  unit: string | null;
  testDate: string | null;
}

export interface Observation {
  obsId: string;
  noteText: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperatureC?: number;
  spo2?: number;
  bmi?: number;
  createdAt: string;
}

export interface Visit {
  visitId: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  department: string;
  reason?: string;
  doctor: Doctor;
}

export interface VisitSummary {
  visitId: string;
  visitDate: string;
  doctor: Doctor;
  diagnoses: Diagnosis[];
  medications: Medication[];
  labResults: LabResult[];
  observations: Observation[];
}

export interface PatientSummary extends Patient {
  visits: VisitSummary[];
}

export interface VisitDetail extends Visit {
  diagnoses: Diagnosis[];
  medications: Medication[];
  labResults: LabResult[];
  observations: Observation[];
}

export interface CohortResult {
  patientId: string;
  name: string;
  lastMatchingLab: {
    value: number;
    date: string;
    visitId: string;
  };
}

export interface ReportSummary {
  totals: {
    patients: number;
    doctors: number;
    activePatients: number;
    visitsLast30Days: number;
    upcomingAppointments: number;
  };
  visitsByDepartment: Array<{ department: string; visitCount: number; patientCount: number }>;
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  labSummaries: Array<{ testName: string; tests: number; averageValue: number | null; lastTestDate: string | null }>;
  monthlyVisitTrends: Array<{ month: string; visitCount: number }>;
}

export interface LoginUserInfo {
  userId: string;
  role: Role;
  email: string;
  doctorId?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUserInfo;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchJSON('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export interface CreatePatientPayload {
  name: string;
  dob: string;
  insurance: string;
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  return fetchJSON('/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function searchPatients(query: string): Promise<Patient[]> {
  return fetchJSON(`/patients?query=${encodeURIComponent(query)}`);
}

export async function listDoctors(): Promise<Doctor[]> {
  return fetchJSON('/doctors');
}

export interface CreateDoctorPayload {
  name: string;
  department: string;
}

export async function createDoctor(payload: CreateDoctorPayload): Promise<Doctor> {
  return fetchJSON('/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function listDoctorAvailability(doctorId: string): Promise<DoctorAvailabilityResponse> {
  return fetchJSON(`/doctors/${doctorId}/availability`);
}

export function createDoctorAvailability(
  doctorId: string,
  payload: { dayOfWeek: number; startMin: number; endMin: number },
): Promise<DoctorAvailabilitySlot> {
  return fetchJSON(`/doctors/${doctorId}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getPatient(
  id: string,
  params?: { include?: 'summary' },
): Promise<Patient | PatientSummary> {
  const qs = new URLSearchParams();
  if (params?.include) qs.set('include', params.include);
  const suffix = qs.toString();
  return fetchJSON(`/patients/${id}${suffix ? `?${suffix}` : ''}`);
}

export async function listPatientVisits(id: string): Promise<Visit[]> {
  return fetchJSON(`/patients/${id}/visits`);
}

export async function getVisit(id: string): Promise<VisitDetail> {
  return fetchJSON(`/visits/${id}`);
}

export interface CreateVisitPayload {
  patientId: string;
  visitDate: string;
  doctorId: string;
  department: string;
  reason?: string;
}

export async function createVisit(payload: CreateVisitPayload): Promise<VisitDetail> {
  return fetchJSON('/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface AddDiagnosisPayload {
  diagnosis: string;
}

export async function addDiagnosis(
  visitId: string,
  payload: AddDiagnosisPayload,
): Promise<Diagnosis> {
  return fetchJSON(`/visits/${visitId}/diagnoses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface AddMedicationPayload {
  drugName: string;
  dosage?: string;
  instructions?: string;
}

export async function addMedication(
  visitId: string,
  payload: AddMedicationPayload,
): Promise<Medication> {
  return fetchJSON(`/visits/${visitId}/medications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface AddLabResultPayload {
  testName: string;
  resultValue?: number;
  unit?: string;
  referenceRange?: string;
  testDate?: string;
}

export async function addLabResult(
  visitId: string,
  payload: AddLabResultPayload,
): Promise<LabResult> {
  return fetchJSON(`/visits/${visitId}/labs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface AddObservationPayload {
  noteText: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperatureC?: number;
  spo2?: number;
  bmi?: number;
}

export async function addObservation(
  visitId: string,
  payload: AddObservationPayload,
): Promise<Observation> {
  return fetchJSON(`/visits/${visitId}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface ListPatientObservationsParams {
  author?: 'me' | 'any';
  before_visit?: string;
  exclude_visit?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function listPatientObservations(
  patientId: string,
  params: ListPatientObservationsParams,
): Promise<Observation[]> {
  const qs = new URLSearchParams();
  if (params.author) qs.set('author', params.author);
  if (params.before_visit) qs.set('before_visit', params.before_visit);
  if (params.exclude_visit) qs.set('exclude_visit', params.exclude_visit);
  if (params.order) qs.set('order', params.order);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));
  const suffix = qs.toString();
  return fetchJSON(`/patients/${patientId}/observations${suffix ? `?${suffix}` : ''}`);
}

export interface CohortParams {
  test_name: string;
  op?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value: number;
  months: number;
}

export async function cohort(params: CohortParams): Promise<CohortResult[]> {
  const qs = new URLSearchParams();
  qs.set('test_name', params.test_name);
  if (params.op) qs.set('op', params.op);
  qs.set('value', String(params.value));
  qs.set('months', String(params.months));
  return fetchJSON(`/insights/cohort?${qs.toString()}`);
}

export async function getReportSummary(): Promise<ReportSummary> {
  return fetchJSON('/reports/summary');
}

export interface UserAccount {
  userId: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  doctorId?: string | null;
  doctor?: Doctor | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: Role;
  doctorId?: string;
}

export interface UpdateUserPayload {
  password?: string;
  role?: Role;
  status?: 'active' | 'inactive';
  doctorId?: string | null;
}

export function listUsers(): Promise<UserAccount[]> {
  return fetchJSON('/users');
}

export function createUserAccount(payload: CreateUserPayload): Promise<UserAccount> {
  return fetchJSON('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateUserAccount(id: string, payload: UpdateUserPayload): Promise<UserAccount> {
  return fetchJSON(`/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
