import { ChangeEvent, FormEvent, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AvatarIcon, CheckIcon, PatientsIcon, SettingsIcon } from '../components/icons';
import { useSettings } from '../context/SettingsProvider';

type DoctorFormState = {
  name: string;
  department: string;
};

export default function Settings() {
  const {
    appName,
    logo,
    users,
    doctors,
    updateSettings,
    addUser,
    addDoctor,
    widgetEnabled,
    setWidgetEnabled,
  } = useSettings();

  const [name, setName] = useState(appName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doctorForm, setDoctorForm] = useState<DoctorFormState>({ name: '', department: '' });

  const totalUsers = users.length;
  const totalDoctors = doctors.length;
  const latestDoctor = totalDoctors > 0 ? doctors[totalDoctors - 1] : undefined;
  const latestUser = totalUsers > 0 ? users[totalUsers - 1] : undefined;

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateSettings({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings({ appName: name.trim() || 'EMR System' });
  }

  function handleAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    addUser({ email: email.trim(), password });
    setEmail('');
    setPassword('');
  }

  async function handleAddDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = doctorForm.name.trim();
    const trimmedDepartment = doctorForm.department.trim();
    if (!trimmedName || !trimmedDepartment) return;

    await addDoctor({ name: trimmedName, department: trimmedDepartment });
    setDoctorForm({ name: '', department: '' });
  }

  const headerStatus = (
    <div className="flex flex-col gap-3 text-sm text-gray-600 md:flex-row md:items-center md:gap-4">
      <span
        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          widgetEnabled
            ? 'bg-green-50 text-green-600'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        Widget {widgetEnabled ? 'Enabled' : 'Disabled'}
      </span>
      <span>
        Portal name synced as <span className="font-medium text-gray-800">{appName}</span>
      </span>
    </div>
  );

  return (
    <DashboardLayout
      title="Organization Settings"
      subtitle="Manage branding, staff accounts, and patient-facing tools."
      activeItem="settings"
      headerChildren={headerStatus}
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SettingsIcon className="h-6 w-6" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Application</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{appName}</div>
                <p className="text-xs text-gray-500">Visible across staff dashboard and patient portal.</p>
              </div>
            </div>
            {logo && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Logo Preview</div>
                <img src={logo} alt="Application logo" className="mt-2 h-12 w-auto" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <AvatarIcon className="h-6 w-6" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active Users</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{totalUsers}</div>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {latestUser ? `Most recent invite: ${latestUser.email}` : 'Invite teammates to collaborate securely.'}
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <PatientsIcon className="h-6 w-6" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Doctors</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{totalDoctors}</div>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {latestDoctor
                ? `${latestDoctor.name} • ${latestDoctor.department}`
                : 'Add clinicians to keep schedules and visits organized.'}
            </p>
          </div>

          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm ${
              widgetEnabled ? 'border-green-100 bg-green-50/60' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  widgetEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <CheckIcon className="h-6 w-6" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Patient Widget</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {widgetEnabled ? 'Active' : 'Turned Off'}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {widgetEnabled
                ? 'Patients can request appointments directly from your portal.'
                : 'Enable the widget to let patients self-schedule and engage.'}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1.1fr]">
          <section className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Branding & Portal Settings</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Update your organization name, upload a logo, and manage the patient widget visibility.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="app-name">
                      Application Name
                    </label>
                    <input
                      id="app-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="logo-upload">
                      Logo
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or SVG up to 1MB.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-800">Patient Self-Service Widget</div>
                    <p className="text-xs text-gray-500">Control visibility of the scheduling widget on your public pages.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={widgetEnabled}
                    onClick={() => setWidgetEnabled(!widgetEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${
                      widgetEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        widgetEnabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                    <span className="sr-only">Toggle patient widget</span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Clinical Directory</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Add providers to keep appointment availability and assignments organized.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddDoctor} className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="doctor-name">
                    Doctor Name
                  </label>
                  <input
                    id="doctor-name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={doctorForm.name}
                    onChange={(event) =>
                      setDoctorForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="doctor-department">
                    Department
                  </label>
                  <input
                    id="doctor-department"
                    type="text"
                    placeholder="Cardiology"
                    value={doctorForm.department}
                    onChange={(event) =>
                      setDoctorForm((prev) => ({ ...prev, department: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Add Doctor
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">Active Doctors</h3>
                {totalDoctors > 0 ? (
                  <ul className="mt-3 space-y-3">
                    {doctors.map((doctor) => (
                      <li
                        key={`${doctor.name}-${doctor.department}`}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                      >
                        <span className="font-medium text-gray-900">{doctor.name}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-600 shadow-sm">
                          {doctor.department}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">
                    No doctors added yet. Create your first provider above to start scheduling visits.
                  </p>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invite Team Members</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Create accounts for administrators, front desk staff, and billers.
                </p>
              </div>

              <form onSubmit={handleAddUser} className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="user-email">
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    placeholder="team@clinic.org"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="user-password">
                    Temporary Password
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Send Invite
                </button>
              </form>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">Current Users</h3>
                {totalUsers > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {users.map((user) => (
                      <li
                        key={user.email}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                      >
                        <span>{user.email}</span>
                        <span className="text-xs text-gray-500">Password set</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">No team members yet. Invite your first collaborator above.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-6">
              <h2 className="text-lg font-semibold text-blue-700">Need onboarding tips?</h2>
              <p className="mt-2 text-sm text-blue-700/80">
                Share a welcome kit with new users so they know how to chart visits, message patients, and review lab
                results. Keep this space updated as your workflows evolve.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
