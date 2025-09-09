import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getVisit,
  addObservation,
  listPatientObservations,
  type VisitDetail,
  type Observation,
  type AddObservationPayload,
} from '../api/client';

export default function VisitDetail() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperatureC, setTemperatureC] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bmi, setBmi] = useState('');

  const [prevNotes, setPrevNotes] = useState<Observation[] | null>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [prevLoading, setPrevLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getVisit(id);
        setVisit(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAddObservation(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const payload: AddObservationPayload = { noteText };
    if (bpSystolic) payload.bpSystolic = parseInt(bpSystolic, 10);
    if (bpDiastolic) payload.bpDiastolic = parseInt(bpDiastolic, 10);
    if (heartRate) payload.heartRate = parseInt(heartRate, 10);
    if (temperatureC) payload.temperatureC = parseFloat(temperatureC);
    if (spo2) payload.spo2 = parseInt(spo2, 10);
    if (bmi) payload.bmi = parseFloat(bmi);
    try {
      await addObservation(id, payload);
      setNoteText('');
      setBpSystolic('');
      setBpDiastolic('');
      setHeartRate('');
      setTemperatureC('');
      setSpo2('');
      setBmi('');
      const data = await getVisit(id);
      setVisit(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPreviousNotes() {
    if (!visit) return;
    setPrevLoading(true);
    try {
      const data = await listPatientObservations(visit.patientId, {
        author: 'me',
        before_visit: visit.visitId,
        exclude_visit: visit.visitId,
        order: 'desc',
        limit: 100,
      });
      setPrevNotes(data);
      setShowPrev(true);
    } catch (err) {
      console.error(err);
    } finally {
      setPrevLoading(false);
    }
  }

  if (loading || !visit) return <div>Loading...</div>;

  return (
    <div>
      <h1>Visit Detail</h1>
      <p>Date: {new Date(visit.visitDate).toLocaleDateString()}</p>
      <p>Department: {visit.department}</p>
      {visit.reason && <p>Reason: {visit.reason}</p>}

      {visit.diagnoses.length > 0 && (
        <div>
          <h2>Diagnoses</h2>
          <ul>
            {visit.diagnoses.map((d, idx) => (
              <li key={idx}>{d.diagnosis}</li>
            ))}
          </ul>
        </div>
      )}

      {visit.medications.length > 0 && (
        <div>
          <h2>Medications</h2>
          <ul>
            {visit.medications.map((m, idx) => (
              <li key={idx}>
                {m.drugName}
                {m.dosage ? ` (${m.dosage})` : ''}
                {m.instructions ? ` - ${m.instructions}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {visit.labResults.length > 0 && (
        <div>
          <h2>Labs</h2>
          <ul>
            {visit.labResults.map((l, idx) => (
              <li key={idx}>
                {l.testName} {l.resultValue ?? ''} {l.unit ?? ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2>Observations</h2>
        {visit.observations.length === 0 ? (
          <p>No observations.</p>
        ) : (
          <ul>
            {visit.observations.map((o) => (
              <li key={o.obsId}>
                <div>{o.noteText}</div>
                <div style={{ fontSize: '0.8rem' }}>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <form onSubmit={handleAddObservation}>
          <h3>Add Observation</h3>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            required
            rows={3}
            cols={50}
          />
          <div>
            <input
              placeholder="BP Systolic"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
            />
            <input
              placeholder="BP Diastolic"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
            />
            <input
              placeholder="Heart Rate"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
            />
            <input
              placeholder="Temp C"
              value={temperatureC}
              onChange={(e) => setTemperatureC(e.target.value)}
            />
            <input
              placeholder="SpO2"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
            />
            <input
              placeholder="BMI"
              value={bmi}
              onChange={(e) => setBmi(e.target.value)}
            />
          </div>
          <button type="submit">Add Observation</button>
        </form>
      </div>

      <button onClick={loadPreviousNotes} style={{ marginBottom: '1rem' }}>
        My previous notes for this patient (before this visit)
      </button>

      {showPrev && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '300px',
            background: '#fff',
            borderLeft: '1px solid #ccc',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <button onClick={() => setShowPrev(false)}>Close</button>
          <h3>Previous Notes</h3>
          {prevLoading && <p>Loading...</p>}
          {prevNotes && prevNotes.length === 0 && <p>No notes</p>}
          {prevNotes && prevNotes.length > 0 && (
            <ul>
              {prevNotes.map((o) => (
                <li key={o.obsId}>
                  <div>{o.noteText}</div>
                  <div style={{ fontSize: '0.8rem' }}>
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

