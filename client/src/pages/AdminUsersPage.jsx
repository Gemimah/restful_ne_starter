import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/auth.service.js';

const ROLES = ['ADMIN', 'INSPECTOR', 'USER'];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await authService.listUsers();
      setUsers(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      load();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const handleRoleChange = async (id, role) => {
    setSavingId(id);
    try {
      await authService.updateUserRole(id, role);
      toast.success('Role updated');
      load();
    } finally {
      setSavingId(null);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
      <p className="mt-1 text-sm text-slate-500">Admin — manage accounts and roles (ADMIN, INSPECTOR, USER)</p>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading users...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Verified</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.isVerified ? 'Yes' : 'No'}</td>
                  <td className="p-3">
                    <select
                      className="rounded-lg border px-2 py-1 text-sm"
                      value={u.role}
                      disabled={savingId === u.id || u.id === user.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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
