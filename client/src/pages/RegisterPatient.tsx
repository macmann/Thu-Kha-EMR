import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../api/client';

export default function RegisterPatient() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [insurance, setInsurance] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const patient = await createPatient({ name, dob, insurance });
      navigate(`/patients/${patient.patientId}`);
    } catch (err) {
      console.error(err);
      window.alert('Failed to register patient');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-5 shadow-xl md:p-7">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Register Patient</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance Partner</label>
            <input
              type="text"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
