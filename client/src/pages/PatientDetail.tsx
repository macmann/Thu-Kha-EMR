import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJSON } from '../api/http';

interface Diagnosis {
  diagnosis: string;
}

interface Medication {
  drugName: string;
  dosage?: string;
  instructions?: string;
}

interface LabResult {
  testName: string;
  resultValue: number | null;
  unit: string | null;
  testDate: string | null;
}

interface Observation {
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

interface VisitSummary {
  visitId: string;
  visitDate: string;
  diagnoses: Diagnosis[];
  medications: Medication[];
  labResults: LabResult[];
  observations: Observation[];
}

interface PatientSummary {
  patientId: string;
  name: string;
  dob: string;
  insurance: string | null;
  visits: VisitSummary[];
}

interface Visit {
  visitId: string;
  visitDate: string;
  department: string;
  reason?: string;
}

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
        const data = await fetchJSON(`/patients/${id}?include=summary`);
        setPatient(data);
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
        const data = await fetchJSON(`/patients/${id}/visits`);
        setVisits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setVisitsLoading(false);
      }
    }
    loadVisits();
  }, [activeTab, id, visits]);

  if (!patient) return <div>Loading...</div>;

  function renderSummary() {
    if (!patient.visits || patient.visits.length === 0) {
      return <div>No visit history.</div>;
    }
    return (
      <div>
        {patient.visits.map((visit) => (
          <div
            key={visit.visitId}
            style={{ border: '1px solid #ccc', padding: '0.5rem', marginBottom: '0.5rem' }}
          >
            <h3>Visit on {new Date(visit.visitDate).toLocaleDateString()}</h3>
            {visit.diagnoses.length > 0 && (
              <p>Diagnoses: {visit.diagnoses.map((d) => d.diagnosis).join(', ')}</p>
            )}
            {visit.medications.length > 0 && (
              <p>
                Medications:{' '}
                {visit.medications
                  .map((m) => (m.dosage ? `${m.drugName} (${m.dosage})` : m.drugName))
                  .join(', ')}
              </p>
            )}
            {visit.labResults.length > 0 && (
              <p>
                Labs:{' '}
                {visit.labResults
                  .map((l) => `${l.testName} ${l.resultValue ?? ''}${l.unit ?? ''}`)
                  .join(', ')}
              </p>
            )}
            {visit.observations.length > 0 && (
              <p>
                Observations:{' '}
                {visit.observations.map((o) => o.noteText).join('; ')}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderVisits() {
    if (visitsLoading) return <div>Loading visits...</div>;
    if (!visits) return null;
    if (visits.length === 0) return <div>No visits found.</div>;
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Date</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Department</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Reason</th>
            <th style={{ borderBottom: '1px solid #ccc' }}></th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v) => (
            <tr key={v.visitId}>
              <td style={{ padding: '0.25rem 0' }}>{new Date(v.visitDate).toLocaleDateString()}</td>
              <td style={{ padding: '0.25rem 0' }}>{v.department}</td>
              <td style={{ padding: '0.25rem 0' }}>{v.reason || ''}</td>
              <td style={{ padding: '0.25rem 0' }}>
                <Link to={`/visits/${v.visitId}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <h1>{patient.name}</h1>
      <p>DOB: {new Date(patient.dob).toLocaleDateString()}</p>
      <p>Insurance: {patient.insurance || ''}</p>
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            marginRight: '1rem',
            fontWeight: activeTab === 'summary' ? 'bold' : undefined,
          }}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          style={{ fontWeight: activeTab === 'visits' ? 'bold' : undefined }}
        >
          Visits
        </button>
      </div>
      {activeTab === 'summary' ? renderSummary() : renderVisits()}
    </div>
  );
}

