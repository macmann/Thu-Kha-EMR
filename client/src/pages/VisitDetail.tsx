import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addObservation,
  getPatient,
  getVisit,
  type Observation,
  type Patient,
  type VisitDetail as VisitDetailType,
} from '../api/client';

export default function VisitDetail() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitDetailType | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const v = await getVisit(id);
        setVisit(v);
        const p = await getPatient(v.patientId);
        setPatient(p as Patient);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAddObservation() {
    if (!id) return;
    const note = window.prompt('Enter observation note');
    if (!note) return;
    try {
      const obs = await addObservation(id, { noteText: note });
      setVisit((v) =>
        v ? { ...v, observations: [obs, ...v.observations] } : v,
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading)
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
          Loading...
        </div>
      </div>
    );

  if (!visit || !patient)
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
          Visit not found
        </div>
      </div>
    );

  const vitalsSource: Observation | undefined = visit.observations.find(
    (o) =>
      o.bpSystolic !== undefined ||
      o.bpDiastolic !== undefined ||
      o.heartRate !== undefined ||
      o.temperatureC !== undefined ||
      o.spo2 !== undefined ||
      o.bmi !== undefined,
  );

  const vitals = {
    bpSystolic: vitalsSource?.bpSystolic ?? 'N/A',
    bpDiastolic: vitalsSource?.bpDiastolic ?? 'N/A',
    heartRate: vitalsSource?.heartRate ?? 'N/A',
    tempC: vitalsSource?.temperatureC ?? 'N/A',
    spo2: vitalsSource?.spo2 ?? 'N/A',
    bmi: vitalsSource?.bmi ?? 'N/A',
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
        <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">DOB:</span> {patient.dob}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">Insurance:</span> {patient.insurance}
        </p>

        <h2 className="mt-6 text-lg font-semibold text-gray-900">Visit Detail</h2>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">Date:</span>{' '}
          {new Date(visit.visitDate).toLocaleDateString()}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">Department:</span> {visit.department}
        </p>
        {visit.reason && (
          <p className="mt-1 text-sm text-gray-700">
            <span className="font-semibold">Reason:</span> {visit.reason}
          </p>
        )}

        <h3 className="mt-6 text-lg font-semibold text-gray-900">Diagnoses</h3>
        <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {visit.diagnoses.map((d) => d.diagnosis).join(', ')}
        </div>

        <h3 className="mt-6 text-lg font-semibold text-gray-900">Medications</h3>
        <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {visit.medications
            .map((m) => (m.dosage ? `${m.drugName} (${m.dosage})` : m.drugName))
            .join(', ')}
        </div>

        <h3 className="mt-6 text-lg font-semibold text-gray-900">Labs</h3>
        <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {visit.labResults
            .map(
              (l) =>
                `${l.testName} ${l.resultValue ?? ''}${l.unit ?? ''}`.trim(),
            )
            .join(', ')}
        </div>

        <h3 className="mt-6 text-lg font-semibold text-gray-900">Observations</h3>
        <div className="mt-2 space-y-3">
          {visit.observations.map((o) => (
            <div
              key={o.obsId}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-medium text-gray-900">
                {o.noteText}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {new Date(o.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddObservation}
          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Add Observation
        </button>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">BP Systolic</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {vitals.bpSystolic}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">
              BP Diastolic
            </div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {vitals.bpDiastolic}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">Heart Rate</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {vitals.heartRate}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">Temp C</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {vitals.tempC}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">SpO2</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {vitals.spo2}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">BMI</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {vitals.bmi}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          My previous notes for this patient (before this visit)
        </p>
      </div>
    </div>
  );
}

