import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchPatients, type Patient } from '../api/client';
import DashboardLayout from './DashboardLayout';
import { PatientsIcon, SearchIcon } from './icons';

const quickFilters = [
  { label: 'Recently Registered', query: '2024' },
  { label: 'Medicare Coverage', query: 'Medicare' },
  { label: 'Hypertension', query: 'Hypertension' },
  { label: 'Diabetes', query: 'Diabetes' },
];

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    let isCancelled = false;

    async function search() {
      if (!debounced) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const data = await searchPatients(debounced);
        if (!isCancelled) {
          setResults(data);
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) {
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    search();

    return () => {
      isCancelled = true;
    };
  }, [debounced]);

  const headerContent = (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
      <div className="relative w-full md:w-80">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search patients by name, ID, or insurance..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>
      <Link
        to="/register"
        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
      >
        Register Patient
      </Link>
    </div>
  );

  const hasQuery = debounced.length > 0;
  const resultCount = results.length;

  return (
    <DashboardLayout
      title="Patient Directory"
      subtitle="Find and manage patient records across the organization."
      activeItem="patients"
      headerChildren={headerContent}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
              <p className="mt-1 text-sm text-gray-600">
                {hasQuery
                  ? `Showing ${resultCount} matching ${resultCount === 1 ? 'record' : 'records'}.`
                  : 'Start typing to explore the patient directory.'}
              </p>
            </div>
            {hasQuery && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                {resultCount} match{resultCount === 1 ? '' : 'es'}
              </span>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <SearchIcon className="h-10 w-10 animate-spin text-blue-500" />
                <div className="text-sm font-medium text-gray-700">Searching for matching patients...</div>
                <p className="text-xs text-gray-500">Hang tight while we gather the latest records.</p>
              </div>
            ) : resultCount > 0 ? (
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Date of Birth</th>
                    <th className="px-6 py-3">Insurance</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {results.map((patient) => {
                    const coverage = patient.insurance?.trim() || 'Self-pay';

                    return (
                      <tr key={patient.patientId} className="transition hover:bg-blue-50/40">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-xs text-gray-500">ID: {patient.patientId}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(patient.dob).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {coverage}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/patients/${patient.patientId}`}
                            className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <PatientsIcon className="h-10 w-10 text-gray-300" />
                <div className="text-sm font-medium text-gray-700">
                  {hasQuery
                    ? 'No patients match your search just yet.'
                    : 'Search for patients by name, patient ID, or insurance provider.'}
                </div>
                {!hasQuery && (
                  <p className="text-xs text-gray-500">Try "Jane" or "Medicare" to explore the directory.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Quick Filters</h3>
            <p className="mt-1 text-sm text-gray-600">Jump into commonly referenced patient segments.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.map((filter) => {
                const isActive = query.toLowerCase() === filter.query.toLowerCase();
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => setQuery(filter.query)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Need to add someone?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Can&apos;t find the patient you&apos;re looking for? Create a new record in just a few steps.
            </p>
            <Link
              to="/register"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              Register Patient
            </Link>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
