import { useEffect, useState } from 'react';
import { Flame, Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { extinguisherService } from '../services/extinguisher.service.js';
import { authService } from '../services/auth.service.js';
import { validateExtinguisherDates } from '../utils/validation.js';
import PageHeader from '../components/PageHeader.jsx';

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
  assignedInspectorId: '',
};

function inspectorLabel(user) {
  if (!user) return 'Unassigned';
  return `${user.firstName} ${user.lastName}`;
}

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
    assignedInspectorId: item.assignedInspectorId || '',
  };
}

function minExpiryDate(installationDate) {
  if (!installationDate) return undefined;
  const d = new Date(installationDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function DateField({ id, label, hint, value, onChange, min, error }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-700">
        {label}
      </label>
      {hint && <p className="mb-1 text-xs text-slate-500">{hint}</p>}
      <input
        id={id}
        type="date"
        required
        min={min}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border px-3 py-2 text-sm ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ExtinguishersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isInspector = user?.role === 'INSPECTOR';
  const canCreate = isAdmin;
  const canEdit = isAdmin || isInspector;
  const canDelete = isAdmin;
  const [items, setItems] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const load = async () => {
    try {
      const { data } = await extinguisherService.getAll({ limit: 100 });
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      authService.listUsers().then(({ data }) => {
        setInspectors((data.data || []).filter((u) => u.role === 'INSPECTOR'));
      }).catch(() => {});
    }
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const dateErrors = validateExtinguisherDates(form.installationDate, form.expiryDate);
    if (Object.keys(dateErrors).length > 0) {
      setFormErrors(dateErrors);
      toast.error('Please fix the date fields');
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      await extinguisherService.create({
        ...form,
        assignedInspectorId: form.assignedInspectorId || undefined,
      });
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
    const dateErrors = validateExtinguisherDates(editForm.installationDate, editForm.expiryDate);
    if (Object.keys(dateErrors).length > 0) {
      setEditErrors(dateErrors);
      toast.error('Please fix the date fields');
      return;
    }
    setEditErrors({});
    setSubmitting(true);
    try {
      const payload = { ...editForm };
      if (isInspector) {
        delete payload.serialNumber;
        delete payload.assignedInspectorId;
      } else if (!payload.assignedInspectorId) {
        payload.assignedInspectorId = null;
      }
      await extinguisherService.update(editingId, payload);
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

  const handleAssign = async (id, assignedInspectorId) => {
    try {
      await extinguisherService.assign(id, assignedInspectorId);
      toast.success('Inspector assignment updated');
      load();
    } catch {
      toast.error('Could not assign inspector');
    }
  };

  const pageSubtitle = isInspector
    ? 'Extinguishers assigned to you for inspection and maintenance'
    : isAdmin
      ? 'Register company assets and assign field inspectors'
      : 'View fire safety equipment across the facility';

  return (
    <div>
      <PageHeader icon={Flame} title="Fire Extinguishers" subtitle={pageSubtitle} />

      {canCreate && !editingId && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border bg-white p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
            <Plus className="h-4 w-4 text-red-600" strokeWidth={2} aria-hidden />
            Register new extinguisher
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Serial number</label>
              <input
                placeholder="e.g. FE-TZW-001"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Location</label>
              <input
                placeholder="e.g. Building A - Floor 1"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Type</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Size</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('LB_', '').replace('_', '.')} lb
                  </option>
                ))}
              </select>
            </div>
            <DateField
              id="create-installation-date"
              label="Installation date"
              hint="When the unit was put in service at this location"
              value={form.installationDate}
              error={formErrors.installationDate}
              onChange={(e) => {
                const installationDate = e.target.value;
                setForm({ ...form, installationDate });
                if (formErrors.installationDate || formErrors.expiryDate) {
                  setFormErrors(validateExtinguisherDates(installationDate, form.expiryDate));
                }
              }}
            />
            <DateField
              id="create-expiry-date"
              label="Expiry date"
              hint="When the unit expires and must be replaced or serviced"
              value={form.expiryDate}
              min={minExpiryDate(form.installationDate)}
              error={formErrors.expiryDate}
              onChange={(e) => {
                const expiryDate = e.target.value;
                setForm({ ...form, expiryDate });
                if (formErrors.expiryDate) {
                  setFormErrors(validateExtinguisherDates(form.installationDate, expiryDate));
                }
              }}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Assign inspector</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.assignedInspectorId}
                onChange={(e) => setForm({ ...form, assignedInspectorId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {inspectors.map((insp) => (
                  <option key={insp.id} value={insp.id}>
                    {insp.firstName} {insp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Register Extinguisher
              </button>
            </div>
          </div>
        </form>
      )}

      {editingId && canEdit && (
        <form onSubmit={handleUpdate} className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-3 font-semibold text-amber-900">Edit Extinguisher</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Serial number</label>
              <input
                required
                readOnly={isInspector}
                className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${isInspector ? 'bg-slate-100 text-slate-600' : ''}`}
                value={editForm.serialNumber}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Location</label>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Type</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Size</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editForm.size}
                onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <DateField
              id="edit-installation-date"
              label="Installation date"
              hint="When the unit was put in service"
              value={editForm.installationDate}
              error={editErrors.installationDate}
              onChange={(e) => {
                const installationDate = e.target.value;
                setEditForm({ ...editForm, installationDate });
                if (editErrors.installationDate || editErrors.expiryDate) {
                  setEditErrors(validateExtinguisherDates(installationDate, editForm.expiryDate));
                }
              }}
            />
            <DateField
              id="edit-expiry-date"
              label="Expiry date"
              hint="Must be after installation date"
              value={editForm.expiryDate}
              min={minExpiryDate(editForm.installationDate)}
              error={editErrors.expiryDate}
              onChange={(e) => {
                const expiryDate = e.target.value;
                setEditForm({ ...editForm, expiryDate });
                if (editErrors.expiryDate) {
                  setEditErrors(validateExtinguisherDates(editForm.installationDate, expiryDate));
                }
              }}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Assign inspector</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editForm.assignedInspectorId}
                  onChange={(e) => setEditForm({ ...editForm, assignedInspectorId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {inspectors.map((insp) => (
                    <option key={insp.id} value={insp.id}>
                      {insp.firstName} {insp.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            <div><dt className="text-slate-500">Assigned inspector</dt><dd>{inspectorLabel(detail.assignedInspector)}</dd></div>
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
                <th className="p-3">Inspector</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    {isInspector ? 'No extinguishers assigned to you yet.' : 'No extinguishers registered.'}
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.serialNumber}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.status}</span></td>
                  <td className="p-3">
                    {isAdmin ? (
                      <select
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                        value={item.assignedInspectorId || ''}
                        onChange={(e) => handleAssign(item.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {inspectors.map((insp) => (
                          <option key={insp.id} value={insp.id}>
                            {insp.firstName} {insp.lastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      inspectorLabel(item.assignedInspector)
                    )}
                  </td>
                  <td className="p-3">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="p-3 space-x-2">
                    <button type="button" onClick={() => viewDetails(item.id)} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                      <Eye className="h-3.5 w-3.5" aria-hidden /> View
                    </button>
                    {canEdit && (
                      <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1 text-amber-600 hover:underline">
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button type="button" onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-1 text-red-600 hover:underline">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                      </button>
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
