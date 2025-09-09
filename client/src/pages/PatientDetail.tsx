import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavigationButtons from '../components/NavigationButtons';
import {
  getPatient,
  listPatientVisits,
  type PatientSummary,
  type Visit,
} from '../api/client';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'visits'>('summary');
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [visitsLoading, setVisitsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getPatient(id, { include: 'summary' });
        setPatient(data as PatientSummary);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadVisits() {
      if (activeTab !== 'visits' || !id || visits) return;
      setVisitsLoading(true);
      try {
        const data = await listPatientVisits(id);
        setVisits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setVisitsLoading(false);
      }
    }
    loadVisits();
  }, [activeTab, id, visits]);

  if (!patient)
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
          <div>Loading...</div>
        </div>
      </div>
    );

  function renderSummary(p: PatientSummary) {
    if (!p.visits || p.visits.length === 0) {
      return <div className="mt-6">No visit history.</div>;
    }
    return (
      <div className="mt-5 space-y-5">
        {p.visits.map((visit) => (
          <section
            key={visit.visitId}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-gray-900">
              Visit on {new Date(visit.visitDate).toLocaleDateString()}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              {visit.diagnoses.length > 0 && (
                <p>
                  <span className="font-semibold">Diagnoses:</span>{' '}
                  {visit.diagnoses.map((d) => d.diagnosis).join(', ')}
                </p>
              )}
              {visit.medications.length > 0 && (
                <p>
                  <span className="font-semibold">Medications:</span>{' '}
                  {visit.medications
                    .map((m) =>
                      m.dosage ? `${m.drugName} (${m.dosage})` : m.drugName,
                    )
                    .join(', ')}
                </p>
              )}
              {visit.labResults.length > 0 && (
                <p>
                  <span className="font-semibold">Labs:</span>{' '}
                  {visit.labResults
                    .map(
                      (l) =>
                        `${l.testName} ${l.resultValue ?? ''}${l.unit ?? ''}`,
                    )
                    .join(', ')}
                </p>
              )}
              {visit.observations.length > 0 && (
                <p>
                  <span className="font-semibold">Observations:</span>{' '}
                  {visit.observations.map((o) => o.noteText).join('; ')}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    );
  }

  function renderVisits() {
    if (visitsLoading) return <div className="mt-6">Loading visits...</div>;
    if (!visits) return null;
    if (visits.length === 0) return <div className="mt-6">No visits found.</div>;
    return (
      <div className="mt-5 space-y-5">
        {visits.map((v) => (
          <section
            key={v.visitId}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Visit on {new Date(v.visitDate).toLocaleDateString()}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Department:</span> {v.department}
                  </p>
                  {v.reason && (
                    <p>
                      <span className="font-semibold">Reason:</span> {v.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  to={`/visits/${v.visitId}`}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {patient.name}
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            <span className="font-semibold">DOB:</span>{' '}
            {new Date(patient.dob).toLocaleDateString()}
          </p>
          <p className="mt-1 text-sm text-gray-700">
            <span className="font-semibold">Insurance:</span>{' '}
            {patient.insurance || ''}
          </p>
        </div>

        <div className="mt-4 border-b border-gray-200">
          <nav role="tablist" className="flex gap-6">
            <button
              role="tab"
              aria-selected={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
              className={
                '-mb-px px-1 pb-3 text-sm font-medium focus:outline-none ' +
                (activeTab === 'summary'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300')
              }
            >
              Summary
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'visits'}
              onClick={() => setActiveTab('visits')}
              className={
                '-mb-px px-1 pb-3 text-sm font-medium focus:outline-none ' +
                (activeTab === 'visits'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300')
              }
            >
              Visits
            </button>
          </nav>
        </div>

          {activeTab === 'summary' ? renderSummary(patient) : renderVisits()}
        <NavigationButtons />
      </div>
    </div>
  );
}

