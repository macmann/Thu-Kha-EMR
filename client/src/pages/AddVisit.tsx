import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  createVisit,
  addDiagnosis,
  addMedication,
  addLabResult,
  addObservation,
  listDoctors,
  type Doctor,
} from '../api/client';
import { useAuth } from '../context/AuthProvider';

export default function AddVisit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [department, setDepartment] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reason, setReason] = useState('');
  const [diagnoses, setDiagnoses] = useState('');
  const [medications, setMedications] = useState('');
  const [labs, setLabs] = useState('');
  const [obsNote, setObsNote] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperatureC, setTemperatureC] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bmi, setBmi] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    listDoctors()
      .then(setDoctors)
      .catch((err) => console.error(err));
  }, [accessToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !user || !doctorId) return;
    setSaving(true);
    try {
      const visit = await createVisit({
        patientId: id,
        visitDate,
        doctorId,
        department,
        reason: reason || undefined,
      });
      const visitId = visit.visitId;

      const diagList = diagnoses
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);
      for (const d of diagList) {
        await addDiagnosis(visitId, { diagnosis: d });
      }

      const medList = medications
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean);
      for (const m of medList) {
        const [drugName, dosage] = m.split('|').map((s) => s.trim());
        await addMedication(visitId, {
          drugName,
          ...(dosage && { dosage }),
        });
      }

      const labList = labs
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      for (const l of labList) {
        const [testName, value, unit] = l.split('|').map((s) => s.trim());
        await addLabResult(visitId, {
          testName,
          ...(value && !isNaN(Number(value)) && { resultValue: Number(value) }),
          ...(unit && { unit }),
        });
      }

      if (
        obsNote ||
        bpSystolic ||
        bpDiastolic ||
        heartRate ||
        temperatureC ||
        spo2 ||
        bmi
      ) {
        await addObservation(visitId, {
          noteText: obsNote,
          ...(bpSystolic && { bpSystolic: Number(bpSystolic) }),
          ...(bpDiastolic && { bpDiastolic: Number(bpDiastolic) }),
          ...(heartRate && { heartRate: Number(heartRate) }),
          ...(temperatureC && { temperatureC: Number(temperatureC) }),
          ...(spo2 && { spo2: Number(spo2) }),
          ...(bmi && { bmi: Number(bmi) }),
        });
      }

      navigate(`/patients/${id}?tab=visits`);
    } catch (err) {
      console.error(err);
      window.alert('Failed to save visit');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
        <h1 className="text-2xl font-semibold text-gray-900">Add Visit</h1>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Visit Date
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Doctor
            </label>
            <select
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                const doc = doctors.find((d) => d.doctorId === e.target.value);
                setDepartment(doc ? doc.department : '');
              }}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="" disabled>
                Select Doctor
              </option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorId}>
                  {`${d.name} - ${d.department}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              value={department}
              readOnly
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diagnoses (one per line)
            </label>
            <textarea
              value={diagnoses}
              onChange={(e) => setDiagnoses(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Medications (drug|dosage per line)
            </label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Labs (test|value|unit per line)
            </label>
            <textarea
              value={labs}
              onChange={(e) => setLabs(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observation Note
            </label>
            <textarea
              value={obsNote}
              onChange={(e) => setObsNote(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                BP Systolic
              </label>
              <input
                type="number"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                BP Diastolic
              </label>
              <input
                type="number"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Heart Rate
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Temp (°C)
              </label>
              <input
                type="number"
                value={temperatureC}
                onChange={(e) => setTemperatureC(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SpO2
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                BMI
              </label>
              <input
                type="number"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Visit'}
          </button>
        </form>
      </div>
    </div>
  );
}

