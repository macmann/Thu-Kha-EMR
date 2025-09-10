import { useState } from 'react';
import { cohort, type CohortResult } from '../api/client';
import PageLayout from '../components/PageLayout';

export default function Cohort() {
  const [testName, setTestName] = useState('');
  const [op, setOp] = useState('gt');
  const [value, setValue] = useState('');
  const [months, setMonths] = useState('6');
  const [results, setResults] = useState<CohortResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await cohort({
        test_name: testName,
        op: op as any,
        value: parseFloat(value),
        months: parseInt(months, 10),
      });
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cohort');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <h1>Cohort Insights</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div>
          <label>
            Test Name:
            <input
              list="test-suggestions"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              required
            />
            <datalist id="test-suggestions">
              <option value="HbA1c" />
              <option value="LDL" />
            </datalist>
          </label>
        </div>
        <div>
          <label>
            Operator:
            <select value={op} onChange={(e) => setOp(e.target.value)}>
              <option value="gt">&gt;</option>
              <option value="gte">&gt;=</option>
              <option value="lt">&lt;</option>
              <option value="lte">&lt;=</option>
              <option value="eq">=</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Value:
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Months:
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Value</th>
              <th>Date</th>
              <th>Visit</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.patientId}>
                <td>{r.name}</td>
                <td>{r.lastMatchingLab.value}</td>
                <td>{new Date(r.lastMatchingLab.date).toLocaleDateString()}</td>
                <td>
                  <a href={`/visits/${r.lastMatchingLab.visitId}`}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PageLayout>
  );
}

