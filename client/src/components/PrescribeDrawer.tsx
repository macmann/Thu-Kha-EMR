import { useState } from 'react';
import { fetchJSON } from '../api/http';

interface PrescribeDrawerProps {
  visitId: string;
  patientId: string;
}

interface DraftItem {
  drugId: string;
  dose: string;
  route: string;
  frequency: string;
  durationDays: number;
  quantityPrescribed: number;
}

const DEFAULT_ITEM: DraftItem = {
  drugId: '',
  dose: '',
  route: 'PO',
  frequency: 'TID',
  durationDays: 5,
  quantityPrescribed: 10,
};

export default function PrescribeDrawer({ visitId, patientId }: PrescribeDrawerProps) {
  const [items, setItems] = useState<DraftItem[]>([{ ...DEFAULT_ITEM }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function updateItem(index: number, changes: Partial<DraftItem>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    );
  }

  function addItem() {
    setItems((current) => [...current, { ...DEFAULT_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  }

  async function handleSave() {
    if (items.some((item) => !item.drugId || !item.dose || !item.route || !item.frequency)) {
      window.alert('Please complete all required medication details.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetchJSON(`/visits/${visitId}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          notes,
          items: items.map((item) => ({
            ...item,
            durationDays: Number(item.durationDays) || 1,
            quantityPrescribed: Number(item.quantityPrescribed) || 1,
          })),
        }),
      });
      const allergyHits = (response as { allergyHits?: string[] }).allergyHits ?? [];
      if (allergyHits.length) {
        window.alert(`Allergy warning: ${allergyHits.join(', ')}`);
      } else {
        window.alert('Prescription created.');
      }
      setItems([{ ...DEFAULT_ITEM }]);
      setNotes('');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Unable to save prescription');
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Prescribe (MVP)</h2>
          <p className="text-xs text-gray-500">Enter the drug IDs from the drug master to send an e-prescription.</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center justify-center rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Add item
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Medication #{index + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-gray-600">
                <span>Drug UUID</span>
                <input
                  value={item.drugId}
                  onChange={(event) => updateItem(index, { drugId: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="00000000-0000-0000-0000-000000000001"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-gray-600">
                <span>Dose</span>
                <input
                  value={item.dose}
                  onChange={(event) => updateItem(index, { dose: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="500 mg"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-gray-600">
                <span>Route</span>
                <input
                  value={item.route}
                  onChange={(event) => updateItem(index, { route: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="PO"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-gray-600">
                <span>Frequency</span>
                <input
                  value={item.frequency}
                  onChange={(event) => updateItem(index, { frequency: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="TID"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-gray-600">
                <span>Duration (days)</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={item.durationDays}
                  onChange={(event) => updateItem(index, { durationDays: Number(event.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-gray-600">
                <span>Quantity</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={item.quantityPrescribed}
                  onChange={(event) => updateItem(index, { quantityPrescribed: Number(event.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <label className="mt-4 block text-xs font-medium text-gray-600">
        <span className="mb-1 block">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Take after meals"
        />
      </label>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {saving ? 'Saving…' : 'Save & Sign'}
      </button>
    </aside>
  );
}
