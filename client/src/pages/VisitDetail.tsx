import React from 'react';

interface VisitDetailPageProps {
  patient: {
    name: string;
    dob: string;
    insurance: string | null;
  };
  visit: {
    date: string;
    department: string;
    reason?: string;
    diagnoses: string;
    medications: string;
    labs: string;
  };
  observations: { id: string; title: string; timestamp: string }[];
  onAddObservation: () => void;
  vitals: {
    bpSystolic: string | number;
    bpDiastolic: string | number;
    heartRate: string | number;
    tempC: string | number;
    spo2: string | number;
    bmi: string | number;
  };
}

export default function VisitDetail(props: VisitDetailPageProps) {
  const { patient, visit, observations, onAddObservation, vitals } = props;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
        {/* Patient header */}
        <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">DOB:</span> {patient.dob}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">Insurance:</span> {patient.insurance}
        </p>

        {/* Visit Detail */}
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Visit Detail</h2>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">Date:</span> {visit.date}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold">Department:</span> {visit.department}
        </p>
        {visit.reason && (
          <p className="mt-1 text-sm text-gray-700">
            <span className="font-semibold">Reason:</span> {visit.reason}
          </p>
        )}

        {/* Diagnoses */}
        <h3 className="mt-6 text-lg font-semibold text-gray-900">Diagnoses</h3>
        <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {visit.diagnoses}
        </div>

        {/* Medications */}
        <h3 className="mt-6 text-lg font-semibold text-gray-900">Medications</h3>
        <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {visit.medications}
        </div>

        {/* Labs */}
        <h3 className="mt-6 text-lg font-semibold text-gray-900">Labs</h3>
        <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {visit.labs}
        </div>

        {/* Observations */}
        <h3 className="mt-6 text-lg font-semibold text-gray-900">Observations</h3>
        <div className="mt-2 space-y-3">
          {observations.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-900">{o.title}</div>
              <div className="mt-1 text-xs text-gray-500">{o.timestamp}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddObservation}
          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Add Observation
        </button>

        {/* Vitals grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">BP Systolic</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{vitals.bpSystolic}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">BP Diastolic</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{vitals.bpDiastolic}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">Heart Rate</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{vitals.heartRate}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">Temp C</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{vitals.tempC}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">SpO2</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{vitals.spo2}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">BMI</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{vitals.bmi}</div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-sm text-gray-500">
          My previous notes for this patient (before this visit)
        </p>
      </div>
    </div>
  );
}

