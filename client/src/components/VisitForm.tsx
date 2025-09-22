import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Doctor } from '../api/client';
import {
  createVisitFormInitialValues,
  type VisitFormInitialValues,
  type VisitFormSubmitValues,
  type VisitFormObservationValues,
} from '../utils/visitForm';

interface VisitFormProps {
  doctors: Doctor[];
  initialValues?: VisitFormInitialValues;
  onSubmit: (values: VisitFormSubmitValues) => Promise<void> | void;
  submitLabel?: string;
  saving?: boolean;
  disableDoctorSelection?: boolean;
  disableVisitDate?: boolean;
  submitDisabled?: boolean;
  extraActions?: ReactNode;
}

type VisitFormState = {
  visitDate: string;
  doctorId: string;
  department: string;
  reason: string;
  diagnoses: string;
  medications: string;
  labs: string;
  obsNote: string;
  bpSystolic: string;
  bpDiastolic: string;
  heartRate: string;
  temperatureC: string;
  spo2: string;
  bmi: string;
};

export default function VisitForm({
  doctors,
  initialValues,
  onSubmit,
  submitLabel = 'Save Visit',
  saving = false,
  disableDoctorSelection = false,
  disableVisitDate = false,
  submitDisabled = false,
  extraActions = null,
}: VisitFormProps) {
  const [state, setState] = useState<VisitFormState>(() =>
    toState(initialValues ?? createVisitFormInitialValues()),
  );

  const initialKey = useMemo(
    () => JSON.stringify(initialValues ?? {}),
    [initialValues],
  );

  const doctorLookup = useMemo(() => {
    const map = new Map<string, Doctor>();
    doctors.forEach((doctor) => {
      map.set(doctor.doctorId, doctor);
    });
    return map;
  }, [doctors]);

  useEffect(() => {
    setState(toState(initialValues ?? createVisitFormInitialValues()));
  }, [initialKey, initialValues]);

  useEffect(() => {
    setState((current) => {
      if (!current.doctorId) {
        return current;
      }
      const doc = doctorLookup.get(current.doctorId);
      if (!doc) {
        return current;
      }
      if (current.department === doc.department) {
        return current;
      }
      return { ...current, department: doc.department };
    });
  }, [doctorLookup]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const diagnoses = state.diagnoses
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const medications = state.medications
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((line) => {
        const [drugName, dosage] = line.split('|').map((part) => part.trim());
        return {
          drugName,
          ...(dosage ? { dosage } : {}),
        };
      });

    const labs = state.labs
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((line) => {
        const [testName, value, unit] = line.split('|').map((part) => part.trim());
        const resultValue = value && !Number.isNaN(Number(value)) ? Number(value) : undefined;
        return {
          testName,
          ...(resultValue !== undefined ? { resultValue } : {}),
          ...(unit ? { unit } : {}),
        };
      });

    const observationValues = buildObservation(state);

    await onSubmit({
      visitDate: state.visitDate,
      doctorId: state.doctorId,
      department: state.department,
      reason: state.reason.trim() ? state.reason.trim() : undefined,
      diagnoses,
      medications,
      labs,
      observation: observationValues,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Visit Date</label>
        <input
          type="date"
          value={state.visitDate}
          onChange={(event) => setState((current) => ({ ...current, visitDate: event.target.value }))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          required
          disabled={disableVisitDate}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Doctor</label>
        <select
          value={state.doctorId}
          onChange={(event) => {
            const doctorId = event.target.value;
            const doctor = doctorLookup.get(doctorId);
            setState((current) => ({
              ...current,
              doctorId,
              department: doctor ? doctor.department : '',
            }));
          }}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          required
          disabled={disableDoctorSelection}
        >
          <option value="" disabled>
            Select Doctor
          </option>
          {doctors.map((doctor) => (
            <option key={doctor.doctorId} value={doctor.doctorId}>
              {`${doctor.name} - ${doctor.department}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <input
          type="text"
          value={state.department}
          readOnly
          className="mt-1 w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reason</label>
        <input
          type="text"
          value={state.reason}
          onChange={(event) => setState((current) => ({ ...current, reason: event.target.value }))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Diagnoses (one per line)</label>
        <textarea
          value={state.diagnoses}
          onChange={(event) => setState((current) => ({ ...current, diagnoses: event.target.value }))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Medications (drug|dosage per line)</label>
        <textarea
          value={state.medications}
          onChange={(event) => setState((current) => ({ ...current, medications: event.target.value }))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Labs (test|value|unit per line)</label>
        <textarea
          value={state.labs}
          onChange={(event) => setState((current) => ({ ...current, labs: event.target.value }))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observation Note</label>
        <textarea
          value={state.obsNote}
          onChange={(event) => setState((current) => ({ ...current, obsNote: event.target.value }))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">BP Systolic</label>
          <input
            type="number"
            value={state.bpSystolic}
            onChange={(event) => setState((current) => ({ ...current, bpSystolic: event.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">BP Diastolic</label>
          <input
            type="number"
            value={state.bpDiastolic}
            onChange={(event) => setState((current) => ({ ...current, bpDiastolic: event.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Heart Rate</label>
          <input
            type="number"
            value={state.heartRate}
            onChange={(event) => setState((current) => ({ ...current, heartRate: event.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temp (°C)</label>
          <input
            type="number"
            value={state.temperatureC}
            onChange={(event) => setState((current) => ({ ...current, temperatureC: event.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SpO2</label>
          <input
            type="number"
            value={state.spo2}
            onChange={(event) => setState((current) => ({ ...current, spo2: event.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">BMI</label>
          <input
            type="number"
            value={state.bmi}
            onChange={(event) => setState((current) => ({ ...current, bmi: event.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || submitDisabled}
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow ${
            saving || submitDisabled ? 'cursor-not-allowed bg-gray-300 text-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        {extraActions}
      </div>
    </form>
  );
}

function toState(values: VisitFormInitialValues): VisitFormState {
  return {
    visitDate: values.visitDate,
    doctorId: values.doctorId,
    department: values.department,
    reason: values.reason ?? '',
    diagnoses: values.diagnoses.join('\n'),
    medications: values.medications
      .map((medication) =>
        medication.dosage ? `${medication.drugName}|${medication.dosage}` : medication.drugName,
      )
      .join('\n'),
    labs: values.labs
      .map((lab) => {
        const parts = [lab.testName];
        if (lab.resultValue !== undefined) {
          parts.push(String(lab.resultValue));
        }
        if (lab.unit) {
          if (parts.length === 1) {
            parts.push('');
          }
          parts.push(lab.unit);
        }
        return parts.join('|');
      })
      .join('\n'),
    obsNote: values.observation?.noteText ?? '',
    bpSystolic: values.observation?.bpSystolic?.toString() ?? '',
    bpDiastolic: values.observation?.bpDiastolic?.toString() ?? '',
    heartRate: values.observation?.heartRate?.toString() ?? '',
    temperatureC: values.observation?.temperatureC?.toString() ?? '',
    spo2: values.observation?.spo2?.toString() ?? '',
    bmi: values.observation?.bmi?.toString() ?? '',
  };
}

function buildObservation(
  state: VisitFormState,
): VisitFormObservationValues | undefined {
  const note = state.obsNote.trim();
  const bpSystolic = state.bpSystolic.trim();
  const bpDiastolic = state.bpDiastolic.trim();
  const heartRate = state.heartRate.trim();
  const temperatureC = state.temperatureC.trim();
  const spo2 = state.spo2.trim();
  const bmi = state.bmi.trim();

  const hasValues =
    note || bpSystolic || bpDiastolic || heartRate || temperatureC || spo2 || bmi;

  if (!hasValues) {
    return undefined;
  }

  return {
    noteText: note,
    ...(bpSystolic ? { bpSystolic: Number(bpSystolic) } : {}),
    ...(bpDiastolic ? { bpDiastolic: Number(bpDiastolic) } : {}),
    ...(heartRate ? { heartRate: Number(heartRate) } : {}),
    ...(temperatureC ? { temperatureC: Number(temperatureC) } : {}),
    ...(spo2 ? { spo2: Number(spo2) } : {}),
    ...(bmi ? { bmi: Number(bmi) } : {}),
  };
}
