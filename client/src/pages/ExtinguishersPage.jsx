import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { extinguisherService } from '../services/extinguisher.service.js';

const TYPES = ['WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL'];
const SIZES = ['LB_1_5', 'LB_5', 'LB_9', 'LB_12'];
const STATUSES = ['ACTIVE', 'EXPIRED', 'NEEDS_INSPECTION', 'OUT_OF_SERVICE'];

const emptyForm = {
  serialNumber: '',
  location: '',
  type: 'WATER',
  size: 'LB_5',
  installationDate: '',
  expiryDate: '',
  status: 'ACTIVE',
};

function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
}

function formFromItem(item) {
  return {
    serialNumber: item.serialNumber,
    location: item.location,
    type: item.type,
    size: item.size,
    installationDate: toDateInput(item.installationDate),
    expiryDate: toDateInput(item.expiryDate),
    status: item.status,
  };
}

export default function ExtinguishersPage() {
  const { user } = useAuth();
  const canManage = ['ADMIN', 'INSPECTOR'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await extinguisherService.getAll({ limit: 100 });
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await extinguisherService.create(form);
      toast.success('Fire extinguisher registered');
      setForm(emptyForm);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm(formFromItem(item));
    setDetail(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await extinguisherService.update(editingId, editForm);
      toast.success('Extinguisher updated');
      setEditingId(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const viewDetails = async (id) => {
    setDetailLoading(true);
    setEditingId(null);
    try {
      const { data } = await extinguisherService.getById(id);
      setDetail(data.data);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this extinguisher?')) return;
    await extinguisherService.remove(id);
    toast.success('Deleted');
    if (detail?.id === id) setDetail(null);
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Fire Extinguishers</h2>
      <p className="text-sm text-slate-500">Register and manage fire safety equipment</p>

      {canManage && !editingId && (
        <form onSubmit={handleCreate} className="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4">
          <input placeholder="Serial Number" required className="rounded-lg border px-3 py-2 text-sm" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
          <input placeholder="Location" required className="rounded-lg border px-3 py-2 text-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
            {SIZES.map((s) => <option key={s} value={s}>{s.replace('LB_', '').replace('_', '.')} lb</option>)}
          </select>
          <input type="date" required title="Installation Date" className="rounded-lg border px-3 py-2 text-sm" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} />
          <input type="date" required title="Expiry Date" className="rounded-lg border px-3 py-2 text-sm" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button type="submit" disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Register Extinguisher
          </button>
        </form>
      )}

      {editingId && canManage && (
        <form onSubmit={handleUpdate} className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-3 font-semibold text-amber-900">Edit Extinguisher</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <input required className="rounded-lg border px-3 py-2 text-sm" value={editForm.serialNumber} onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })} />
            <input required className="rounded-lg border px-3 py-2 text-sm" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            <select className="rounded-lg border px-3 py-2 text-sm" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="rounded-lg border px-3 py-2 text-sm" value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" required className="rounded-lg border px-3 py-2 text-sm" value={editForm.installationDate} onChange={(e) => setEditForm({ ...editForm, installationDate: e.target.value })} />
            <input type="date" required className="rounded-lg border px-3 py-2 text-sm" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} />
            <select className="rounded-lg border px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Save Changes</button>
            <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {detailLoading && <p className="mt-4 text-sm text-slate-500">Loading details...</p>}

      {detail && (
        <div className="mt-6 rounded-xl border bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{detail.serialNumber}</h3>
              <p className="text-sm text-slate-500">{detail.location} · {detail.type} · {detail.status}</p>
            </div>
            <button onClick={() => setDetail(null)} className="text-sm text-slate-500 hover:text-slate-800">Close</button>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Size</dt><dd>{detail.size}</dd></div>
            <div><dt className="text-slate-500">Installed</dt><dd>{new Date(detail.installationDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-slate-500">Expires</dt><dd>{new Date(detail.expiryDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-slate-500">Inspections</dt><dd>{detail.inspections?.length ?? 0} recent</dd></div>
            <div><dt className="text-slate-500">Maintenance logs</dt><dd>{detail.maintenanceLogs?.length ?? 0} recent</dd></div>
          </dl>
        </div>
      )}

      {loading ? <p className="mt-6">Loading...</p> : (
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">Serial</th>
                <th className="p-3">Location</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.serialNumber}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.status}</span></td>
                  <td className="p-3">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => viewDetails(item.id)} className="text-blue-600 hover:underline">View</button>
                    {canManage && (
                      <button onClick={() => startEdit(item)} className="text-amber-600 hover:underline">Edit</button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
