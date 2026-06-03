import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/auth.service.js';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await authService.updateProfile(profile);
    setUser(data.user);
    toast.success('Profile updated');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    await authService.changePassword(passwords);
    toast.success('Password changed');
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  return (
    <div className="max-w-lg space-y-8">
      <h2 className="text-2xl font-bold">Profile</h2>
      <form onSubmit={saveProfile} className="space-y-3 rounded-xl border bg-white p-4">
        <h3 className="font-medium">Update Information</h3>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
        <input className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
        <input type="email" className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Save</button>
      </form>
      <form onSubmit={changePassword} className="space-y-3 rounded-xl border bg-white p-4">
        <h3 className="font-medium">Change Password</h3>
        <input type="password" placeholder="Current password" className="w-full rounded-lg border px-3 py-2 text-sm" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
        <input type="password" placeholder="New password" className="w-full rounded-lg border px-3 py-2 text-sm" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
        <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Change Password</button>
      </form>
    </div>
  );
}
