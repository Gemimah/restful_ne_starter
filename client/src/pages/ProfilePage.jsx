import { useState } from 'react';
import { UserCircle, User, Mail, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/auth.service.js';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import IconInput from '../components/ui/IconInput.jsx';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
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
    <div className="max-w-lg">
      <PageHeader
        icon={UserCircle}
        title="Profile"
        subtitle="Update your account details and password"
      />

      <form onSubmit={saveProfile} className="space-y-4">
        <SectionCard icon={User} title="Personal information">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>First name</label>
              <IconInput
                icon={User}
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <IconInput
                icon={User}
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Last name"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <IconInput
                icon={Mail}
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Save className="h-4 w-4" aria-hidden />
              Save profile
            </button>
          </div>
        </SectionCard>
      </form>

      <form onSubmit={changePassword} className="mt-6">
        <SectionCard icon={Lock} title="Change password">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Current password</label>
              <IconInput
                icon={Lock}
                type="password"
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <IconInput
                icon={Lock}
                type="password"
                placeholder="At least 6 characters"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Lock className="h-4 w-4" aria-hidden />
              Update password
            </button>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
