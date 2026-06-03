import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { extinguisherService, inspectionService } from '../services/extinguisher.service.js';

export default function InspectionsPage() {
  const { user } = useAuth();
  const canUpdate = ['ADMIN', 'INSPECTOR'].includes(user?.role);
  const [inspections, setInspections] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [form, setForm] = useState({ extinguisherId: '', scheduledDate: '', scheduledTime: '09:00', notes: '' });

  const load = async () => {
    const [insp, ext] = await Promise.all([
      inspectionService.getAll({ limit: 50 }),
      extinguisherService.getAll({ limit: 100 }),
    ]);
    setInspections(insp.data.data || []);
    setExtinguishers(ext.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    await inspectionService.schedule(form);
    toast.success('Inspection scheduled — notification sent');
    setForm({ extinguisherId: '', scheduledDate: '', scheduledTime: '09:00', notes: '' });
    load();
  };

  const markComplete = async (id) => {
    await inspectionService.update(id, { status: 'COMPLETED' });
    toast.success('Marked completed');
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Inspection Scheduling</h2>
      <form onSubmit={handleSchedule} className="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
        <select required className="rounded-lg border px-3 py-2 text-sm" value={form.extinguisherId} onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}>
          <option value="">Select Fire Extinguisher</option>
          {extinguishers.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.serialNumber} — {ex.location}</option>
          ))}
        </select>
        <input type="date" required className="rounded-lg border px-3 py-2 text-sm" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
        <input type="time" required className="rounded-lg border px-3 py-2 text-sm" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} />
        <input placeholder="Notes" className="rounded-lg border px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white md:col-span-2">Schedule Inspection</button>
      </form>

      <div className="mt-6 space-y-2">
        {inspections.map((insp) => (
          <div key={insp.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div>
              <p className="font-medium">{insp.extinguisher?.serialNumber} — {insp.extinguisher?.location}</p>
              <p className="text-sm text-slate-500">
                {new Date(insp.scheduledDate).toLocaleDateString()} at {insp.scheduledTime} · {insp.status}
              </p>
            </div>
            {canUpdate && insp.status === 'PENDING' && (
              <button onClick={() => markComplete(insp.id)} className="text-sm text-green-600 hover:underline">Complete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
