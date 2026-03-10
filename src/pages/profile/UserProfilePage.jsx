import { useState } from 'react';
import { User, Key } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import { RoleBadge } from '../../components/common/Badge';
import { changePassword } from '../../services/authService';
import useAuthStore from '../../store/authStore';

export default function UserProfilePage() {
  const { user } = useAuthStore();
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChangePw = async () => {
    if (pw.newPassword !== pw.confirm) return setMsg('Passwords do not match');
    setSaving(true);
    try {
      await changePassword({ oldPassword: pw.oldPassword, newPassword: pw.newPassword });
      setMsg('Password changed successfully!');
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setMsg(err.message || 'Failed to change password'); } finally { setSaving(false); }
  };

  return (
    <PageLayout>
      <PageHeader title="My Profile" />
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <User size={24} className="text-accent-green" />
            </div>
            <div>
              <h3 className="text-text-primary font-semibold text-lg">{user?.fullName}</h3>
              <div className="flex items-center gap-2 mt-1"><RoleBadge role={user?.role} /><span className="text-text-muted text-xs font-mono">{user?.staffId}</span></div>
            </div>
          </div>
          {[['Department', user?.department || '—'], ['Email', user?.email || '—'], ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—']].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-bg-border text-sm last:border-0">
              <span className="text-text-muted">{k}</span>
              <span className="text-text-primary">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2"><Key size={16} className="text-accent-green" />Change Password</h3>
          <div className="space-y-3">
            {[['Current Password', 'oldPassword'], ['New Password', 'newPassword'], ['Confirm New Password', 'confirm']].map(([label, k]) => (
              <div key={k}><label className="label">{label}</label><input type="password" className="input-field" value={pw[k]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))} /></div>
            ))}
            {msg && <p className={`text-xs ${msg.includes('success') ? 'text-accent-green' : 'text-risk-high'}`}>{msg}</p>}
            <button onClick={handleChangePw} disabled={saving} className="btn-primary w-full mt-2 disabled:opacity-60">{saving ? 'Saving...' : 'Update Password'}</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
