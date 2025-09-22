import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  createVisit,
  listDoctors,
  type Doctor,
} from '../api/client';
import { useAuth } from '../context/AuthProvider';
import VisitForm from '../components/VisitForm';
import {
  createVisitFormInitialValues,
  persistVisitFormValues,
  type VisitFormSubmitValues,
} from '../utils/visitForm';

export default function AddVisit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [saving, setSaving] = useState(false);

  const initialValues = useMemo(
    () =>
      createVisitFormInitialValues({
        visitDate: new Date().toISOString().slice(0, 10),
        ...(user?.doctorId ? { doctorId: user.doctorId } : {}),
      }),
    [user?.doctorId],
  );

  useEffect(() => {
    if (!accessToken) return;
    listDoctors()
      .then(setDoctors)
      .catch((err) => console.error(err));
  }, [accessToken]);

  async function handleSubmit(values: VisitFormSubmitValues) {
    if (!id || !user || !values.doctorId) return;
    setSaving(true);
    try {
      const visit = await createVisit({
        patientId: id,
        visitDate: values.visitDate,
        doctorId: values.doctorId,
        department: values.department,
        reason: values.reason,
      });
      await persistVisitFormValues(visit.visitId, values);
      navigate(`/patients/${id}?tab=visits`);
    } catch (err) {
      console.error(err);
      window.alert('Failed to save visit');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-5 md:p-7">
        <h1 className="text-2xl font-semibold text-gray-900">Add Visit</h1>
        <div className="mt-4">
          <VisitForm
            doctors={doctors}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}

