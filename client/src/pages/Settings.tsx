import { useState } from 'react';
import { useSettings } from '../context/SettingsProvider';

type TabKey = 'general' | 'doctor';

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
  const [docName, setDocName] = useState('');
  const [dept, setDept] = useState('');
  const [tab, setTab] = useState<TabKey>('general');

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateSettings({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({ appName: name });
  }

  function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    addUser({ email, password });
    setEmail('');
    setPassword('');
  }

  async function handleAddDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!docName || !dept) return;
    await addDoctor({ name: docName, department: dept });
    setDocName('');
    setDept('');
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex space-x-4 border-b">
          <button
            className={`px-3 py-2 ${
              tab === 'general'
                ? 'border-b-2 border-blue-600 font-semibold'
                : 'text-gray-600'
            }`}
            onClick={() => setTab('general')}
          >
            General
          </button>
          <button
            className={`px-3 py-2 ${
              tab === 'doctor'
                ? 'border-b-2 border-blue-600 font-semibold'
                : 'text-gray-600'
            }`}
            onClick={() => setTab('doctor')}
          >
            Add Doctor
          </button>
        </div>

        {tab === 'general' && (
          <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo
                </label>
                <input type="file" accept="image/*" onChange={handleLogoChange} />
                {logo && <img src={logo} alt="logo" className="mt-2 h-16" />}
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={widgetEnabled}
                    onChange={(e) => setWidgetEnabled(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Widget On/Off</span>
                </label>
              </div>
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Save Settings
              </button>
            </form>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Create User</h2>
              <form onSubmit={handleAddUser} className="space-y-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add User
                </button>
              </form>
              {users.length > 0 && (
                <ul className="mt-4 list-disc pl-5">
                  {users.map((u, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {u.email}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'doctor' && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Add Doctor</h2>
            <form onSubmit={handleAddDoctor} className="space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <input
                type="text"
                placeholder="Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Doctor
              </button>
            </form>
            {doctors.length > 0 && (
              <ul className="mt-4 list-disc pl-5">
                {doctors.map((d, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {d.name} - {d.department}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
