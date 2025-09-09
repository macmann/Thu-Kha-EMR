import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchPatients, type Patient } from '../api/client';

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<Patient[]>([]);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    async function search() {
      if (!debounced) {
        setResults([]);
        return;
      }
      try {
        const data = await searchPatients(debounced);
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    }
    search();
  }, [debounced]);

  return (
    <div>
      <input
        placeholder="Search patients"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>DOB</th>
            <th>Insurance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((p) => (
            <tr key={p.patientId}>
              <td>{p.name}</td>
              <td>{new Date(p.dob).toLocaleDateString()}</td>
              <td>{p.insurance || ''}</td>
              <td>
                <Link to={`/patients/${p.patientId}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
