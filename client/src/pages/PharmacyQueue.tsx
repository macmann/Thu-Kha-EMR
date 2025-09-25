import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchJSON } from '../api/http';

interface QueueItem {
  prescriptionId: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  patient?: { patientId: string; name: string };
  doctor?: { doctorId: string; name: string };
  items: Array<{
    itemId: string;
    drugId: string;
    dose: string;
    route: string;
    frequency: string;
    durationDays: number;
    quantityPrescribed: number;
  }>;
}

const STATUS_OPTIONS = ['PENDING', 'PARTIAL', 'DISPENSED'] as const;

type StatusOption = (typeof STATUS_OPTIONS)[number];

export default function PharmacyQueue() {
  const [status, setStatus] = useState<StatusOption>('PENDING');
  const [data, setData] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchJSON(`/prescriptions?status=${status}`);
        if (!cancelled) {
          setData((response as { data?: QueueItem[] }).data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load queue');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const subtitle = useMemo(() => {
    if (loading) return 'Loading pharmacy worklist…';
    if (error) return error;
    if (!data.length) return 'No prescriptions waiting in this state.';
    return `${data.length} prescription${data.length === 1 ? '' : 's'} queued.`;
  }, [data.length, error, loading]);

  return (
    <DashboardLayout title="Pharmacy" subtitle={subtitle} activeItem="pharmacy">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dispensing Queue</h1>
            <p className="text-sm text-gray-600">Monitor incoming e-prescriptions and jump into dispensing.</p>
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusOption)}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading prescriptions…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Nothing in the queue for this status.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((item) => (
              <article key={item.prescriptionId} className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-blue-600">Rx #{item.prescriptionId.slice(0, 8)}</div>
                    <h2 className="text-base font-semibold text-gray-900">{item.patient?.name ?? 'Patient'}</h2>
                    <p className="text-xs text-gray-500">Ordered by {item.doctor?.name ?? 'Doctor'}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{item.status}</span>
                </div>

                <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-700">
                  {item.items.map((line) => (
                    <li key={line.itemId} className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{line.dose}</div>
                        <div className="text-xs text-gray-500">
                          {line.route} • {line.frequency} • {line.durationDays} days
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">Qty {line.quantityPrescribed}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/pharmacy/dispense/${item.prescriptionId}`}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Start Dispense
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
