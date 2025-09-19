import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <DashboardLayout title="Appointment detail" activeItem="appointments">
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Appointment detail placeholder
        {id ? ` for ${id}` : ''}
      </div>
    </DashboardLayout>
  );
}
