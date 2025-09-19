import DashboardLayout from '../components/DashboardLayout';

export default function AppointmentForm() {
  return (
    <DashboardLayout title="Schedule appointment" activeItem="appointments">
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Appointment form placeholder
      </div>
    </DashboardLayout>
  );
}
