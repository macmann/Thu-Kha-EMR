import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchPatients, type Patient } from '../api/client';
import BackButton from './BackButton';

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
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 md:p-8 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-80 rounded-full border border-gray-300 bg-white px-4 pr-10 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-3.5-3.5" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">DOB</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Insurance</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((p) => (
                <tr key={p.patientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{p.name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(p.dob).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{p.insurance || ''}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/patients/${p.patientId}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <BackButton />
      </div>
    </div>
  );
}
