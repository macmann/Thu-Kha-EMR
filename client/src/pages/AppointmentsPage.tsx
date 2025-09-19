import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CalendarIcon } from '../components/icons';
import {
  listAppointments,
  patchStatus,
  type Appointment,
  type AppointmentListParams,
  type AppointmentStatus,
  type AppointmentStatusPatch,
} from '../api/appointments';
import { listDoctors, type Doctor } from '../api/client';

type DateMode = 'single' | 'range';

type ToastState = {
  id: number;
  title: string;
  message: string;
  link?: { to: string; label: string };
};

const allowedTransitions: Record<AppointmentStatus, AppointmentStatusPatch[]> = {
  Scheduled: ['CheckedIn', 'Cancelled'],
  CheckedIn: ['InProgress', 'Cancelled'],
  InProgress: ['Completed'],
  Completed: [],
  Cancelled: [],
};

const statusVisuals: Record<AppointmentStatus, { label: string; chipClass: string; dotClass: string }> = {
  Scheduled: {
    label: 'Scheduled',
    chipClass: 'border-blue-200 bg-blue-50 text-blue-600',
    dotClass: 'bg-blue-500',
  },
  CheckedIn: {
    label: 'Checked-in',
    chipClass: 'border-amber-200 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
  },
  InProgress: {
    label: 'In progress',
    chipClass: 'border-purple-200 bg-purple-50 text-purple-600',
    dotClass: 'bg-purple-500',
  },
  Completed: {
    label: 'Completed',
    chipClass: 'border-green-200 bg-green-50 text-green-700',
    dotClass: 'bg-green-500',
  },
  Cancelled: {
    label: 'Cancelled',
    chipClass: 'border-gray-200 bg-gray-100 text-gray-600',
    dotClass: 'bg-gray-400',
  },
};

type Tone = 'neutral' | 'primary' | 'success' | 'danger';

const toneStyles: Record<Tone, { enabled: string; disabled: string }> = {
  neutral: {
    enabled: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    disabled: 'bg-gray-100 text-gray-300 cursor-not-allowed',
  },
  primary: {
    enabled: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    disabled: 'bg-blue-200 text-blue-300 cursor-not-allowed',
  },
  success: {
    enabled: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    disabled: 'bg-green-200 text-green-300 cursor-not-allowed',
  },
  danger: {
    enabled: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    disabled: 'bg-red-200 text-red-300 cursor-not-allowed',
  },
};

const actionConfigs: Array<{
  key: string;
  label: string;
  targetStatus: AppointmentStatusPatch;
  tone: Tone;
  confirm?: boolean;
}> = [
  { key: 'check-in', label: 'Check-in', targetStatus: 'CheckedIn', tone: 'neutral' },
  { key: 'start', label: 'Start', targetStatus: 'InProgress', tone: 'primary' },
  { key: 'complete', label: 'Complete', targetStatus: 'Completed', tone: 'success' },
  { key: 'cancel', label: 'Cancel', targetStatus: 'Cancelled', tone: 'danger', confirm: true },
];

const statusOptions: AppointmentStatus[] = ['Scheduled', 'CheckedIn', 'InProgress', 'Completed', 'Cancelled'];

function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        const message = (parsed as { error?: { message?: string } }).error?.message;
        if (message) return message;
      }
    } catch (err) {
      // ignore JSON parse errors and fall back to raw message
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Something went wrong. Please try again.';
}

function formatDateDisplay(value: string | Date | null | undefined) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(minutes: number) {
  const clamped = Math.max(0, Math.min(24 * 60, minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = ((hours + 11) % 12) + 1;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function formatTimeRange(startMin: number, endMin: number) {
  if (endMin <= startMin) {
    return formatTime(startMin);
  }
  return `${formatTime(startMin)} – ${formatTime(endMin)}`;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateMode, setDateMode] = useState<DateMode>('single');
  const [singleDate, setSingleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [refreshToken, setRefreshToken] = useState(0);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctors() {
      setDoctorsLoading(true);
      setDoctorError(null);
      try {
        const list = await listDoctors();
        if (!cancelled) {
          setDoctors(list);
        }
      } catch (err) {
        if (!cancelled) {
          setDoctorError(parseErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setDoctorsLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      setLoading(true);
      setError(null);
      try {
        const params: AppointmentListParams = { limit: 50 };
        if (dateMode === 'single') {
          if (singleDate) {
            params.date = singleDate;
          }
        } else {
          if (fromDate) params.from = fromDate;
          if (toDate) params.to = toDate;
        }
        if (doctorId) {
          params.doctorId = doctorId;
        }
        if (statusFilter) {
          params.status = statusFilter;
        }

        const result = await listAppointments(params);
        if (!cancelled) {
          setAppointments(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(parseErrorMessage(err));
          setAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [dateMode, singleDate, fromDate, toDate, doctorId, statusFilter, refreshToken]);

  useEffect(() => {
    if (!toast) return undefined;
    const handle = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const headerActions = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Link
        to="/appointments/new"
        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
      >
        New Appointment
      </Link>
    </div>
  );

  const hasActiveFilters =
    (dateMode === 'single' ? Boolean(singleDate) : Boolean(fromDate || toDate)) || doctorId !== '' || statusFilter !== '';

  function handleClearFilters() {
    setDateMode('single');
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setDoctorId('');
    setStatusFilter('');
  }

  function isUpdating(id: string) {
    return Boolean(updating[id]);
  }

  async function handleStatusChange(
    appointment: Appointment,
    targetStatus: AppointmentStatusPatch,
    requireConfirm?: boolean,
  ) {
    if (requireConfirm) {
      const confirmed = window.confirm('Cancel this appointment?');
      if (!confirmed) return;
    }

    setActionError(null);
    setUpdating((prev) => ({ ...prev, [appointment.appointmentId]: true }));

    try {
      const result = await patchStatus(appointment.appointmentId, { status: targetStatus });

      if ('visitId' in result) {
        setAppointments((current) =>
          current.map((item) =>
            item.appointmentId === appointment.appointmentId
              ? { ...item, status: 'Completed', cancelReason: null }
              : item,
          ),
        );
        setToast({
          id: Date.now(),
          title: 'Visit created',
          message: `A visit was created for ${appointment.patient.name}.`,
          link: { to: `/visits/${result.visitId}`, label: 'Open visit details' },
        });
      } else {
        setAppointments((current) =>
          current.map((item) => (item.appointmentId === result.appointmentId ? result : item)),
        );
      }
    } catch (err) {
      setActionError(parseErrorMessage(err));
    } finally {
      setUpdating((prev) => {
        const next = { ...prev };
        delete next[appointment.appointmentId];
        return next;
      });
    }
  }

  function handleRefresh() {
    setRefreshToken((token) => token + 1);
  }

  return (
    <DashboardLayout
      title="Appointments"
      subtitle="Monitor and manage patient visits as they progress through the day."
      activeItem="appointments"
      headerChildren={headerActions}
    >
      <>
        {toast && (
          <div className="pointer-events-none fixed bottom-6 right-6 z-50">
            <div className="pointer-events-auto flex w-80 items-start gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500" aria-hidden="true" />
              <div className="flex-1 text-sm">
                <div className="font-semibold text-gray-900">{toast.title}</div>
                <p className="mt-1 text-gray-600">{toast.message}</p>
                {toast.link && (
                  <Link
                    to={toast.link.to}
                    className="mt-3 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                    onClick={() => setToast(null)}
                  >
                    {toast.link.label}
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="-mr-2 rounded-full p-1 text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <p className="mt-1 text-sm text-gray-600">Refine appointments by schedule, doctor, or status.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    hasActiveFilters
                      ? 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                      : 'border border-gray-100 text-gray-300'
                  }`}
                >
                  Clear filters
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</div>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setDateMode('single')}
                      className={`px-4 py-2 text-sm font-medium transition ${
                        dateMode === 'single'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Single day
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateMode('range')}
                      className={`px-4 py-2 text-sm font-medium transition ${
                        dateMode === 'range'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Date range
                    </button>
                  </div>
                </div>
                {dateMode === 'single' ? (
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(event) => setSingleDate(event.target.value)}
                      className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 lg:w-auto"
                    />
                    <span className="self-center text-xs text-gray-400">Leave blank to show all dates</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:w-auto"
                      placeholder="From"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:w-auto"
                      placeholder="To"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Doctor</div>
                <select
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctorId} value={doctor.doctorId}>
                      {doctor.name} — {doctor.department}
                    </option>
                  ))}
                </select>
                {doctorError ? (
                  <p className="text-xs text-red-600">{doctorError}</p>
                ) : doctorsLoading ? (
                  <p className="text-xs text-gray-400">Loading doctors...</p>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</div>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      setStatusFilter('');
                    } else {
                      setStatusFilter(value as AppointmentStatus);
                    }
                  }}
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusVisuals[status].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Scheduled Appointments</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {loading
                    ? 'Loading appointments...'
                    : error
                      ? 'Unable to load appointments right now.'
                      : `Showing ${appointments.length} appointment${appointments.length === 1 ? '' : 's'}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Refresh list
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <CalendarIcon className="h-10 w-10 animate-spin text-blue-500" />
                  <div className="text-sm font-medium text-gray-700">Fetching the latest appointments...</div>
                  <p className="text-xs text-gray-500">Please wait while we load the schedule.</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <CalendarIcon className="h-10 w-10 text-red-300" />
                  <div className="text-sm font-medium text-red-600">{error}</div>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Try again
                  </button>
                </div>
              ) : appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-6 py-3">Time</th>
                        <th className="px-6 py-3">Patient</th>
                        <th className="px-6 py-3">Doctor</th>
                        <th className="px-6 py-3">Department</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {appointments.map((appointment) => {
                        const visuals = statusVisuals[appointment.status];
                        const busy = isUpdating(appointment.appointmentId);
                        return (
                          <tr key={appointment.appointmentId} className="transition hover:bg-blue-50/40">
                            <td className="px-6 py-4 align-top">
                              <div className="font-medium text-gray-900">
                                {formatTimeRange(appointment.startTimeMin, appointment.endTimeMin)}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">{formatDateDisplay(appointment.date)}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="font-medium text-gray-900">{appointment.patient.name}</div>
                              <div className="mt-1 text-xs text-gray-500">ID: {appointment.patient.patientId}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="font-medium text-gray-900">{appointment.doctor.name}</div>
                              <div className="mt-1 text-xs text-gray-500">ID: {appointment.doctor.doctorId}</div>
                            </td>
                            <td className="px-6 py-4 align-top text-gray-700">{appointment.department}</td>
                            <td className="px-6 py-4 align-top">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${visuals.chipClass}`}
                              >
                                <span className={`h-2 w-2 rounded-full ${visuals.dotClass}`} aria-hidden="true" />
                                {visuals.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 align-top text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                {actionConfigs.map((action) => {
                                  const allowed = allowedTransitions[appointment.status]?.includes(action.targetStatus) ?? false;
                                  const enabled = allowed && !busy;
                                  const tone = toneStyles[action.tone];
                                  const className = `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                    enabled ? tone.enabled : tone.disabled
                                  }`;
                                  return (
                                    <button
                                      key={action.key}
                                      type="button"
                                      disabled={!enabled}
                                      onClick={() =>
                                        handleStatusChange(appointment, action.targetStatus, action.confirm)
                                      }
                                      className={className}
                                    >
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {busy && (
                                <div className="mt-2 text-xs font-medium text-blue-600">Updating status...</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <CalendarIcon className="h-10 w-10 text-gray-300" />
                  <div className="text-sm font-medium text-gray-700">
                    No appointments match the selected filters.
                  </div>
                  <p className="text-xs text-gray-500">Adjust the filters to explore more of the schedule.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </>
    </DashboardLayout>
  );
}
