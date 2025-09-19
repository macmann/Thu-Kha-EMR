import DashboardLayout from '../components/DashboardLayout';

const filterPlaceholders = ['Date', 'Doctor', 'Status'];

export default function AppointmentsPage() {
  return (
    <DashboardLayout
      title="Appointments"
      subtitle="Week and day calendar views with filters"
      activeItem="appointments"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
            <button type="button" className="bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              Week view
            </button>
            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-500">
              Day view
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterPlaceholders.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                {filter} filter
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Calendar view placeholder
        </div>
      </div>
    </DashboardLayout>
  );
}
