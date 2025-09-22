import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CheckIcon, MessageIcon, RegisterIcon, SearchIcon } from '../components/icons';
import { useAuth } from '../context/AuthProvider';
import {
  getAppointmentQueue,
  patchStatus,
  type Appointment,
  type AppointmentStatus,
} from '../api/appointments';
import {
  createVisit,
  getVisit,
  listDoctors,
  listPatientVisits,
  type Doctor,
  type Observation,
  type VisitDetail,
} from '../api/client';
import VisitForm from '../components/VisitForm';
import {
  createVisitFormInitialValues,
  persistVisitFormValues,
  visitDetailToInitialValues,
  type VisitFormInitialValues,
  type VisitFormObservationValues,
  type VisitFormSubmitValues,
} from '../utils/visitForm';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
  const { user } = useAuth();

  if (user?.role === 'Doctor') {
    return <DoctorQueueDashboard />;
  }

  return <TeamDashboard role={user?.role} />;
}

function TeamDashboard({ role }: { role?: string }) {
  const { t } = useTranslation();
  const taskReminders = [
    { key: 'review-labs', label: t('Review lab results for A. Jones') },
    { key: 'follow-up', label: t('Follow up with Dr. Davis') },
  ];
  const upcomingAppointments = [
    { key: 'john-doe', name: 'John Doe', time: '10:00 AM', detail: t('General Checkup') },
    { key: 'jane-smith', name: 'Jane Smith', time: '11:30 AM', detail: t('Medication Review') },
  ];

  const headerSearch = (
    <div className="relative w-full md:w-72">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder={t('Search patients...')}
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
    </div>
  );

  return (
    <DashboardLayout
      title={t('Team Dashboard')}
      activeItem="dashboard"
      subtitle={
        role === 'AdminAssistant'
          ? t('Monitor appointments and keep patients informed.')
          : t('Track clinic activity and coordinate care.')
      }
      headerChildren={headerSearch}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <RegisterIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('Register New Patient')}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {t('Capture demographics and intake information for walk-in patients.')}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              {t('Register Patient')}
            </Link>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <SearchIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('Search Patient Records')}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {t('Look up patients to confirm coverage, history, and contact details.')}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/patients"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              {t('Search Patient')}
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <div className="text-sm font-medium text-gray-500">{t('Patients Today')}</div>
            <div className="mt-2 text-4xl font-semibold text-gray-900">25</div>
          </div>
          <p className="mt-4 text-sm text-gray-600">{t('Scheduled visits and walk-ins awaiting triage.')}</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <MessageIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">{t('New Messages')}</div>
              <div className="mt-2 text-4xl font-semibold text-gray-900">3</div>
              <p className="mt-2 text-sm text-gray-600">{t('Updates from labs and internal teams.')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">{t('Upcoming Appointments')}</div>
            <Link to="/appointments" className="text-xs font-semibold text-blue-600 hover:underline">
              {t('View schedule')}
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {upcomingAppointments.map((appointment) => (
              <li key={appointment.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                  <div className="text-xs text-gray-500">{appointment.detail}</div>
                </div>
                <span className="text-sm font-semibold text-blue-600">{appointment.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-gray-900">{t('Task Reminders')}</div>
          <ul className="mt-4 space-y-3">
            {taskReminders.map((task) => (
              <li key={task.key} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span className="text-sm text-gray-700">{task.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DoctorQueueDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedVisitDetail, setSelectedVisitDetail] = useState<VisitDetail | null>(null);
  const [visitInitialValues, setVisitInitialValues] = useState<VisitFormInitialValues | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [savingVisit, setSavingVisit] = useState(false);
  const { t } = useTranslation();
  const statusVisuals = getStatusVisuals(t);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAppointmentQueue();
      setAppointments(response.data);
    } catch (err) {
      setError(parseErrorMessage(err, t('Unable to load queue.')));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    let ignore = false;

    async function loadDoctorsList() {
      try {
        const list = await listDoctors();
        if (!ignore) {
          setDoctors(list);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError(parseErrorMessage(err, t('Unable to load doctors.')));
        }
      }
    }

    loadDoctorsList();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!appointments.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((previous) => {
      if (previous && appointments.some((appt) => appt.appointmentId === previous)) {
        return previous;
      }
      return appointments[0].appointmentId;
    });
  }, [appointments]);

  const selected = appointments.find((appt) => appt.appointmentId === selectedId) ?? null;

  useEffect(() => {
    setSuccess(null);
    setError(null);
    setSelectedVisitId(null);
    setSelectedVisitDetail(null);
    setSavingVisit(false);

    if (!selected) {
      setVisitInitialValues(null);
      return;
    }

    const baseValues = createVisitFormInitialValues({
      visitDate: normalizeDateKey(selected.date),
      doctorId: selected.doctorId,
      department: selected.department,
      reason: selected.reason ?? undefined,
    });
    setVisitInitialValues(baseValues);

    let ignore = false;

    async function loadExistingVisitDetails(current: Appointment) {
      try {
        const visits = await listPatientVisits(current.patientId);
        const appointmentDate = normalizeDateKey(current.date);
        const match = visits.find(
          (visit) =>
            visit.doctor.doctorId === current.doctorId &&
            normalizeDateKey(visit.visitDate) === appointmentDate,
        );

        if (!match) {
          return;
        }

        const detail = await getVisit(match.visitId);
        if (!ignore) {
          setSelectedVisitId(match.visitId);
          setSelectedVisitDetail(detail);
          setVisitInitialValues(visitDetailToInitialValues(detail));
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError(parseErrorMessage(err, t('Unable to load existing visit details.')));
        }
      }
    }

    loadExistingVisitDetails(selected);

    return () => {
      ignore = true;
    };
  }, [
    selected?.appointmentId,
    selected?.patientId,
    selected?.doctorId,
    selected?.date,
    selected?.department,
    selected?.reason,
  ]);

  const handleInvite = async (appointment: Appointment) => {
    setInvitingId(appointment.appointmentId);
    setSuccess(null);
    setError(null);
    try {
      await patchStatus(appointment.appointmentId, { status: 'InProgress' });
      await loadQueue();
      setSuccess(t('Invited {name} to the consultation room.', { name: appointment.patient.name }));
      setSelectedId(appointment.appointmentId);
    } catch (err) {
      setError(parseErrorMessage(err, t('Unable to update appointment status.')));
    } finally {
      setInvitingId(null);
    }
  };

  const handleVisitSubmit = async (values: VisitFormSubmitValues) => {
    if (!selected) {
      setError(t('Select an appointment before saving visit details.'));
      return;
    }

    if (!values.doctorId) {
      setError(t('A doctor must be selected for the visit.'));
      return;
    }

    setSavingVisit(true);
    setSuccess(null);
    setError(null);

    try {
      let visitId = selectedVisitId;
      let detail = selectedVisitDetail;

      if (!visitId) {
        const visit = await createVisit({
          patientId: selected.patientId,
          visitDate: values.visitDate,
          doctorId: values.doctorId,
          department: values.department,
          reason: values.reason,
        });
        visitId = visit.visitId;
        await persistVisitFormValues(visitId, values);
        detail = await getVisit(visitId);
      } else {
        const additions = computeVisitAdditions(values, detail);
        const hasAdditions =
          additions.diagnoses.length > 0 ||
          additions.medications.length > 0 ||
          additions.labs.length > 0 ||
          Boolean(additions.observation);

        if (hasAdditions) {
          await persistVisitFormValues(visitId, additions);
          detail = await getVisit(visitId);
        }
      }

      if (detail) {
        setSelectedVisitDetail(detail);
        setVisitInitialValues(visitDetailToInitialValues(detail));
      }

      if (visitId) {
        setSelectedVisitId(visitId);
      }

      if (selected.status !== 'Completed') {
        const result = await patchStatus(selected.appointmentId, { status: 'Completed' });
        if ('visitId' in result && typeof result.visitId === 'string') {
          visitId = result.visitId;
          setSelectedVisitId(result.visitId);
          if (!detail || detail.visitId !== result.visitId) {
            const refreshed = await getVisit(result.visitId);
            setSelectedVisitDetail(refreshed);
            setVisitInitialValues(visitDetailToInitialValues(refreshed));
          }
        }
      }

      setSuccess(
        selected.status === 'Completed'
          ? t('Visit details updated.')
          : t('Visit saved and appointment completed.'),
      );
      await loadQueue();
      setSelectedId(selected.appointmentId);
    } catch (err) {
      console.error(err);
      setError(parseErrorMessage(err, t('Unable to save visit details.')));
    } finally {
      setSavingVisit(false);
    }
  };

  return (
    <DashboardLayout
      title={t("Today's Queue")}
      activeItem="dashboard"
      subtitle={t('Invite your next patient, capture notes, and wrap up the visit.')}
      headerChildren={
        <button
          type="button"
          onClick={loadQueue}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          {t('Refresh Queue')}
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 shadow-sm">
            <SearchIcon className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-gray-600">{t('Loading your appointments...')}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('Upcoming patients')}</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {t('{count} in queue', { count: appointments.length })}
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {appointments.length === 0 ? (
                <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                  {t('No patients waiting. Enjoy a short break!')}
                </li>
              ) : (
                appointments.map((appointment) => {
                  const status = statusVisuals[appointment.status];
                  const isSelected = appointment.appointmentId === selectedId;
                  return (
                    <li
                      key={appointment.appointmentId}
                      className={`rounded-xl border px-4 py-3 transition ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(appointment.appointmentId)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{appointment.patient.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatDateDisplay(appointment.date)} · {formatTimeRange(appointment.startTimeMin, appointment.endTimeMin)}
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.chip}`}>
                          <span className={`mr-2 h-2 w-2 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            {selected ? (
              <div className="flex flex-col gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">{t('Current patient')}</div>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-900">{selected.patient.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {(selected.reason && selected.reason.trim()) || t('No visit reason recorded.')}
                    {' · '}
                    {(selected.location && selected.location.trim()) || t('Room assignment pending')}
                  </p>
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('Scheduled time')}</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {formatDateDisplay(selected.date)} · {formatTimeRange(selected.startTimeMin, selected.endTimeMin)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('Status')}</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">{statusVisuals[selected.status].label}</dd>
                  </div>
                </dl>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">{t('Visit documentation')}</h3>
                  {visitInitialValues ? (
                    <VisitForm
                      doctors={doctors}
                      initialValues={visitInitialValues}
                      onSubmit={handleVisitSubmit}
                      saving={savingVisit}
                      disableDoctorSelection
                      disableVisitDate
                      submitLabel={
                        selected.status === 'Completed'
                          ? t('Update Visit')
                          : t('Save Visit & Complete')
                      }
                      submitDisabled={
                        !(selected.status === 'InProgress' || selected.status === 'Completed')
                      }
                      extraActions={
                        selected.status === 'Scheduled' || selected.status === 'CheckedIn'
                          ? (
                              <button
                                type="button"
                                onClick={() => handleInvite(selected)}
                                disabled={invitingId === selected.appointmentId}
                                className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow transition ${
                                  invitingId === selected.appointmentId
                                    ? 'cursor-not-allowed bg-blue-300'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {invitingId === selected.appointmentId
                                  ? t('Inviting...')
                                  : t('Invite Patient')}
                              </button>
                            )
                          : null
                      }
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                      {t('Loading visit form...')}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}
                {success && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                {t('Select a patient from the queue to begin charting their visit.')}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

function computeVisitAdditions(
  values: VisitFormSubmitValues,
  detail: VisitDetail | null,
): VisitFormSubmitValues {
  if (!detail) {
    return values;
  }

  const existingDiagnoses = new Set(
    detail.diagnoses.map((diagnosis) => createDiagnosisKey(diagnosis.diagnosis)),
  );
  const diagnoses = values.diagnoses.filter((diagnosis) => {
    const key = createDiagnosisKey(diagnosis);
    if (!key || existingDiagnoses.has(key)) {
      return false;
    }
    existingDiagnoses.add(key);
    return true;
  });

  const existingMedications = new Set(
    detail.medications.map((medication) =>
      createMedicationKey({ drugName: medication.drugName, dosage: medication.dosage ?? undefined }),
    ),
  );
  const medications = values.medications.filter((medication) => {
    const key = createMedicationKey(medication);
    if (!key || existingMedications.has(key)) {
      return false;
    }
    existingMedications.add(key);
    return true;
  });

  const existingLabs = new Set(detail.labResults.map((lab) => createLabKey(lab)));
  const labs = values.labs.filter((lab) => {
    const key = createLabKey(lab);
    if (!key || existingLabs.has(key)) {
      return false;
    }
    existingLabs.add(key);
    return true;
  });

  let observation: VisitFormObservationValues | undefined;
  if (values.observation) {
    const latestObservation = detail.observations[0];
    if (observationHasChanges(values.observation, latestObservation)) {
      observation = values.observation;
    }
  }

  return {
    ...values,
    diagnoses,
    medications,
    labs,
    observation,
  };
}

function createDiagnosisKey(value: string): string {
  return value.trim().toLowerCase();
}

function createMedicationKey(medication: { drugName: string; dosage?: string }): string {
  const name = medication.drugName.trim().toLowerCase();
  const dose = medication.dosage ? medication.dosage.trim().toLowerCase() : '';
  return `${name}|${dose}`;
}

function createLabKey(lab: { testName: string; resultValue?: number | null; unit?: string | null }): string {
  const name = lab.testName.trim().toLowerCase();
  const value = lab.resultValue !== undefined && lab.resultValue !== null ? String(lab.resultValue) : '';
  const unit = lab.unit ? lab.unit.trim().toLowerCase() : '';
  return `${name}|${value}|${unit}`;
}

function observationHasChanges(
  next: VisitFormObservationValues,
  latest?: Observation,
): boolean {
  if (!latest) {
    return true;
  }

  if (next.noteText.trim() !== (latest.noteText ?? '').trim()) {
    return true;
  }

  const numericFields = [
    'bpSystolic',
    'bpDiastolic',
    'heartRate',
    'temperatureC',
    'spo2',
    'bmi',
  ] as const satisfies ReadonlyArray<keyof VisitFormObservationValues & keyof Observation>;

  for (const field of numericFields) {
    const nextValue = next[field] ?? null;
    const latestValue = latest[field] ?? null;
    if (nextValue !== latestValue) {
      return true;
    }
  }

  return false;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

function getStatusVisuals(
  t: Translate,
): Record<AppointmentStatus, { label: string; chip: string; dot: string }> {
  return {
    Scheduled: {
      label: t('Scheduled'),
      chip: 'bg-blue-50 text-blue-600',
      dot: 'bg-blue-500',
    },
    CheckedIn: {
      label: t('Checked-in'),
      chip: 'bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    },
    InProgress: {
      label: t('In progress'),
      chip: 'bg-purple-50 text-purple-700',
      dot: 'bg-purple-500',
    },
    Completed: {
      label: t('Completed'),
      chip: 'bg-green-50 text-green-700',
      dot: 'bg-green-500',
    },
    Cancelled: {
      label: t('Cancelled'),
      chip: 'bg-gray-100 text-gray-500',
      dot: 'bg-gray-400',
    },
  };
}

function parseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        const message = (parsed as { error?: string }).error;
        if (message) return message;
      }
    } catch {
      /* ignore */
    }
    return error.message || fallback;
  }
  if (typeof error === 'string') return error;
  return fallback;
}

function formatDateDisplay(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTimeRange(startMin: number, endMin: number) {
  return `${formatTime(startMin)} – ${formatTime(endMin)}`;
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = ((hours + 11) % 12) + 1;
  return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
}

function normalizeDateKey(value: string) {
  return value.includes('T') ? value.split('T')[0] : value;
}
