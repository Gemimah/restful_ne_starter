import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { extinguisherService, maintenanceService } from '../services/extinguisher.service.js';

export default function MaintenancePage() {
  const { user } = useAuth();
  const canLog = ['ADMIN', 'INSPECTOR'].includes(user?.role);
  const [logs, setLogs] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [form, setForm] = useState({
    extinguisherId: '',
    actionTaken: '',
    maintenanceDate: '',
    issuesIdentified: '',
    notes: '',
  });

  const load = async () => {
    const [m, e] = await Promise.all([
      maintenanceService.getAll({ limit: 50 }),
      extinguisherService.getAll({ limit: 100 }),
    ]);
    setLogs(m.data.data || []);
    setExtinguishers(e.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await maintenanceService.create(form);
    toast.success('Maintenance logged');
    setForm({ extinguisherId: '', actionTaken: '', maintenanceDate: '', issuesIdentified: '', notes: '' });
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Maintenance Logging</h2>

      {canLog && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
          <select required className="rounded-lg border px-3 py-2 text-sm" value={form.extinguisherId} onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}>
            <option value="">Select Extinguisher</option>
            {extinguishers.map((ex) => <option key={ex.id} value={ex.id}>{ex.serialNumber}</option>)}
          </select>
          <input required placeholder="Action Taken" className="rounded-lg border px-3 py-2 text-sm" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} />
          <input type="date" required className="rounded-lg border px-3 py-2 text-sm" value={form.maintenanceDate} onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })} />
          <input placeholder="Issues Identified" className="rounded-lg border px-3 py-2 text-sm" value={form.issuesIdentified} onChange={(e) => setForm({ ...form, issuesIdentified: e.target.value })} />
          <textarea placeholder="Notes & Recommendations" className="rounded-lg border px-3 py-2 text-sm md:col-span-2" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white md:col-span-2">Log Maintenance</button>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border bg-white p-4">
            <p className="font-medium">{log.extinguisher?.serialNumber} — {log.actionTaken}</p>
            <p className="text-sm text-slate-500">{new Date(log.maintenanceDate).toLocaleDateString()}</p>
            {log.issuesIdentified && <p className="mt-1 text-sm text-amber-700">Issues: {log.issuesIdentified}</p>}
            {log.notes && <p className="text-sm text-slate-600">{log.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
