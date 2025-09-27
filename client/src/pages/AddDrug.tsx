import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { createDrug, type CreateDrugPayload, type Drug } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';

interface DrugFormState {
  name: string;
  genericName: string;
  form: string;
  strength: string;
  routeDefault: string;
  isActive: boolean;
}

const EMPTY_FORM: DrugFormState = {
  name: '',
  genericName: '',
  form: '',
  strength: '',
  routeDefault: '',
  isActive: true,
};

export default function AddDrug() {
  const { t } = useTranslation();
  const [form, setForm] = useState<DrugFormState>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createdDrug, setCreatedDrug] = useState<Drug | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFeedback(null);
    setCreatedDrug(null);

    const trimmedName = form.name.trim();
    const trimmedForm = form.form.trim();
    const trimmedStrength = form.strength.trim();

    if (!trimmedName || !trimmedForm || !trimmedStrength) {
      setFeedback({
        type: 'error',
        message: t('Name, form, and strength are required to add a medication.'),
      });
      return;
    }

    const payload: CreateDrugPayload = {
      name: trimmedName,
      form: trimmedForm,
      strength: trimmedStrength,
      isActive: form.isActive,
    };

    const generic = form.genericName.trim();
    if (generic) {
      payload.genericName = generic;
    }

    const route = form.routeDefault.trim();
    if (route) {
      payload.routeDefault = route;
    }

    setSaving(true);
    try {
      const created = await createDrug(payload);
      setCreatedDrug(created);
      setForm(() => ({ ...EMPTY_FORM }));
      setFeedback({
        type: 'success',
        message: t('Medication added successfully.'),
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : t('Unable to add medication. Please try again.'),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      title={t('Add medication to formulary')}
      subtitle={t('Capture the key details so the pharmacy team can manage stock and dispensing.')}
      activeItem="pharmacy"
      headerChildren={
        <Link
          to="/pharmacy/inventory"
          className="inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
        >
          {t('Back to inventory')}
        </Link>
      }
    >
      <div className="space-y-6">
        {feedback ? (
          <div
            className={`rounded-2xl border p-5 text-sm shadow-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <p>{feedback.message}</p>
            {feedback.type === 'success' && createdDrug ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700">
                  {createdDrug.name} {createdDrug.strength}
                </span>
                <Link
                  to="/pharmacy/inventory"
                  className="inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                >
                  {t('Manage inventory for this medication')}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('Medication details')}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t('Provide formulary information to make the drug available across the system.')}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {t('Required fields marked with *')}
              </span>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="drug-name">
                    {t('Brand or trade name')}*
                  </label>
                  <input
                    id="drug-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder={t('e.g., Lipitor')}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="drug-generic">
                    {t('Generic name')}
                  </label>
                  <input
                    id="drug-generic"
                    type="text"
                    value={form.genericName}
                    onChange={(event) => setForm((prev) => ({ ...prev, genericName: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder={t('e.g., Atorvastatin')}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="drug-form">
                    {t('Form')}*
                  </label>
                  <input
                    id="drug-form"
                    type="text"
                    value={form.form}
                    onChange={(event) => setForm((prev) => ({ ...prev, form: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder={t('e.g., Tablet')}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="drug-strength">
                    {t('Strength')}*
                  </label>
                  <input
                    id="drug-strength"
                    type="text"
                    value={form.strength}
                    onChange={(event) => setForm((prev) => ({ ...prev, strength: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder={t('e.g., 20 mg')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="drug-route">
                  {t('Default route of administration')}
                </label>
                <input
                  id="drug-route"
                  type="text"
                  value={form.routeDefault}
                  onChange={(event) => setForm((prev) => ({ ...prev, routeDefault: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={t('e.g., Oral')}
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <input
                  id="drug-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label className="text-sm font-medium text-gray-900" htmlFor="drug-active">
                    {t('Active medication')}
                  </label>
                  <p className="text-xs text-gray-600">
                    {t('Inactive drugs remain in the formulary history but are hidden from new orders and inventory searches.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {saving ? t('Saving...') : t('Add medication')}
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setForm(() => ({ ...EMPTY_FORM }));
                    setFeedback(null);
                    setCreatedDrug(null);
                  }}
                >
                  {t('Clear form')}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-blue-900">{t('Tips for complete drug entries')}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-blue-900/80">
                <li>{t('Use the strongest identifier your team recognizes as the brand name.')}</li>
                <li>{t('Include the generic to support clinical decision support and search.')}</li>
                <li>{t('If multiple strengths exist, create a separate entry for each presentation.')}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">{t('Who can see this?')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t(
                  'New medications become available immediately to pharmacists and clinicians when ordering or dispensing.',
                )}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                {t('Only IT Admins and Inventory Managers can add or retire formulary items.')}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
