import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { itemService } from '../services/item.service.js';

// EXAM TIP: Copy this page pattern for your domain entities

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async () => {
    try {
      const { data } = await itemService.getAll();
      setItems(data.data || []);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await itemService.create(form);
      toast.success('Item created');
      setForm({ title: '', description: '' });
      loadItems();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await itemService.remove(id);
      toast.success('Item deleted');
      loadItems();
    } catch {
      // handled
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Items</h2>
      <p className="mt-1 text-sm text-slate-500">Sample CRUD — rename for your exam domain</p>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap gap-3 rounded-xl border bg-white p-4">
        <input
          placeholder="Title"
          required
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Description"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-slate-500">No items yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-slate-500">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
