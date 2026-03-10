import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/common/Modal';
import { RoleBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { listUsers, createUser } from '../../services/reportService';
import { formatDate } from '../../utils/formatters';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ staffId: '', fullName: '', role: 'NURSE', department: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listUsers().then(r => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await createUser(form);
      setUsers(u => [res.data, ...u]);
      setShowModal(false);
      setForm({ staffId: '', fullName: '', role: 'NURSE', department: '', email: '', password: '' });
    } catch (err) { alert(err.message || 'Failed to create user'); } finally { setSaving(false); }
  };

  return (
    <PageLayout>
      <PageHeader title="User Management" subtitle="Manage staff accounts"
        actions={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><UserPlus size={15} /> Add User</button>} />

      <div className="card p-4 lg:p-5">
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-bg-border">{['Staff ID','Name','Role','Department','Status','Created'].map(h => <th key={h} className="text-left text-text-muted font-medium py-3 px-2 text-xs">{h}</th>)}</tr></thead>
                <tbody>{users.map(u => (
                  <tr key={u.id} className="border-b border-bg-border/50 hover:bg-bg-secondary transition-colors">
                    <td className="py-3 px-2 font-mono text-accent-green text-xs">{u.staffId}</td>
                    <td className="py-3 px-2 text-text-primary font-medium">{u.fullName}</td>
                    <td className="py-3 px-2"><RoleBadge role={u.role} /></td>
                    <td className="py-3 px-2 text-text-secondary text-xs">{u.department || '—'}</td>
                    <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full border ${u.isActive ? 'badge-low' : 'badge-high'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3 px-2 text-text-muted text-xs">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {users.map(u => (
                <div key={u.id} className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-text-primary font-medium text-sm">{u.fullName}</p>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-accent-green font-mono text-xs">{u.staffId}</p>
                  <p className="text-text-muted text-xs mt-1">{u.department || 'No department'}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <div className="space-y-3">
          {[['Staff ID','staffId','text','e.g. NURSE002'],['Full Name','fullName','text','Full name'],['Email','email','email','user@hospital.com'],['Department','department','text','e.g. Cardiology'],['Password','password','password','Initial password']].map(([label,k,type,ph]) => (
            <div key={k}>
              <label className="label">{label}</label>
              <input type={type} className="input-field" placeholder={ph} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="label">Role</label>
            <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {['NURSE','PHYSICIAN','DOCTOR','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Creating...' : 'Create User'}</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
