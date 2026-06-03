import { useEffect, useState } from 'react';
import { ClipboardCheck, CalendarPlus, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { extinguisherService, inspectionService } from '../services/extinguisher.service.js';
import PageHeader from '../components/PageHeader.jsx';

export default function InspectionsPage() {
  const { user } = useAuth();
  const isInspector = user?.role === 'INSPECTOR';
  const canSchedule = !isInspector;
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
      <PageHeader
        icon={ClipboardCheck}
        title="Inspection Scheduling"
        subtitle={
          isInspector
            ? 'Complete inspections for extinguishers assigned to you'
            : 'Plan and track fire extinguisher inspections'
        }
      />
      {canSchedule && (
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
        <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white md:col-span-2">
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Schedule Inspection
        </button>
      </form>
      )}

      <div className="mt-6 space-y-2">
        {inspections.length === 0 && (
          <p className="rounded-lg border bg-white p-4 text-sm text-slate-500">
            {isInspector ? 'No inspection tasks assigned to you.' : 'No inspections scheduled yet.'}
          </p>
        )}
        {inspections.map((insp) => (
          <div key={insp.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div>
              <p className="font-medium">{insp.extinguisher?.serialNumber} — {insp.extinguisher?.location}</p>
              <p className="text-sm text-slate-500">
                {new Date(insp.scheduledDate).toLocaleDateString()} at {insp.scheduledTime} · {insp.status}
              </p>
            </div>
            {canUpdate && insp.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => markComplete(insp.id)}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
