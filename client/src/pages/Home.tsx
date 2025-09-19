import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CheckIcon, MessageIcon, RegisterIcon, SearchIcon } from '../components/icons';

export default function Home() {
  const taskReminders = ['Review Lab results for A. Jones', 'Follow up with Dr. Davis'];
  const upcomingAppointments = [
    { name: 'John Doe', time: '10:00 AM' },
    { name: 'Jane Smith', time: '11:30 AM' },
  ];

  const headerSearch = (
    <div className="relative w-full md:w-72">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder="Search patients..."
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
    </div>
  );

  return (
    <DashboardLayout title="Dashboard" activeItem="dashboard" headerChildren={headerSearch}>
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
              <p className="mt-1 text-sm text-gray-600">Find an existing patient by name, ID, or other criteria.</p>
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
    </DashboardLayout>
  );
}
