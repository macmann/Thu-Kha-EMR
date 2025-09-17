import { Link } from 'react-router-dom';

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75h-5.25v-6.75H9v6.75H3.75A.75.75 0 013 21V9.75z"
      />
    </svg>
  );
}

function PatientsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.125a4.125 4.125 0 10-6 0M4.5 9.75a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM12.75 10.125a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0z"
      />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 5.25h13.5a1.5 1.5 0 011.5 1.5V19.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z"
      />
    </svg>
  );
}

function ReportsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 3.75h15a.75.75 0 01.75.75v15a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 15.75l2.25-2.25L12.75 15l3-3"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25h7.5" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 4.5h3M5.25 6.75h13.5a.75.75 0 01.75.75v9a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-9a.75.75 0 01.75-.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 11.25a3 3 0 106 0 3 3 0 00-6 0z"
      />
    </svg>
  );
}

function RegisterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11.25c2.071 0 3.75-1.679 3.75-3.75S14.071 3.75 12 3.75 8.25 5.429 8.25 7.5 9.929 11.25 12 11.25z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 20.25c0-2.485 2.514-4.5 5.25-4.5s5.25 2.015 5.25 4.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25v3m0 0v3m0-3h3m-3 0h-3" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m2.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 5.25h16.5a.75.75 0 01.75.75v11.25a.75.75 0 01-.75.75H6.75L3 21V6a.75.75 0 01.75-.75z"
      />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.28-9.78a.75.75 0 00-1.06-1.06L9 10.44 7.78 9.22a.75.75 0 10-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.75-3.81z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AvatarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
      />
    </svg>
  );
}

export default function Home() {
  const navigation = [
    { name: 'Dashboard', icon: DashboardIcon, to: '/', active: true },
    { name: 'Patients', icon: PatientsIcon, to: '/patients' },
    { name: 'Appointments', icon: CalendarIcon },
    { name: 'Reports', icon: ReportsIcon },
    { name: 'Settings', icon: SettingsIcon, to: '/settings' },
  ];

  const taskReminders = [
    'Review Lab results for A. Jones',
    'Follow up with Dr. Davis',
  ];

  const upcomingAppointments = [
    { name: 'John Doe', time: '10:00 AM' },
    { name: 'Jane Smith', time: '11:30 AM' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white px-6 py-8 shadow-sm md:flex">
        <div className="text-lg font-semibold text-blue-600">EMR System</div>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            );

            if (item.to) {
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className="block"
                  aria-current={item.active ? 'page' : undefined}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.name} type="button" className="w-full text-left">
                {content}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <AvatarIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Dr. Smith</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white">
          <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search patients..."
                  className="w-72 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <AvatarIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <RegisterIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Register New Patient</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Create a new patient record with demographic and health information.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                >
                  Register Patient
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Search Patient Records</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Find an existing patient by name, ID, or other criteria.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/patients"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                >
                  Search Patient
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
              <div>
                <div className="text-sm font-medium text-gray-500">Patients Today</div>
                <div className="mt-2 text-4xl font-semibold text-gray-900">25</div>
              </div>
              <p className="mt-4 text-sm text-gray-600">New registrations and appointments</p>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <MessageIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">New Messages</div>
                  <div className="mt-2 text-4xl font-semibold text-gray-900">3</div>
                  <p className="mt-2 text-sm text-gray-600">From lab and colleagues</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Upcoming Appointments</div>
              <ul className="mt-4 space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                      <div className="text-xs text-gray-500">General Checkup</div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{appointment.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Task Reminders</div>
              <ul className="mt-4 space-y-3">
                {taskReminders.map((task) => (
                  <li key={task} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-gray-700">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
