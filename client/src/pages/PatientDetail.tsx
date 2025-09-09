import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJSON } from '../api/http';

interface Patient {
  patientId: string;
  name: string;
  dob: string;
  insurance: string | null;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await fetchJSON(`/patients/${id}`);
        setPatient(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  if (!patient) return <div>Loading...</div>;

  return (
    <div>
      <h1>{patient.name}</h1>
      <p>DOB: {new Date(patient.dob).toLocaleDateString()}</p>
      <p>Insurance: {patient.insurance || ''}</p>
    </div>
  );
}
