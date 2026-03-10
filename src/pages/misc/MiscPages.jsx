import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Search, ChevronRight, ScrollText, BarChart2, User, Shield, Plus, Loader2 } from 'lucide-react';
import { guidelineService, auditService, reportService, authService, userService } from '../../services/api';
import { PageHeader, LoadingPage, EmptyState, RiskBadge, Alert } from '../../components/common';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import useAuthStore from '../../store/authStore';

// ── GUIDELINES LIBRARY ────────────────────────────────────────────────────────
export function GuidelinesLibraryPage() {
  const [guidelines, setGuidelines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    guidelineService.list({ search }).then(r => setGuidelines(r.data)).finally(() => setLoading(false));
  }, [search]);

  const catColors = {
    'Diabetes Management': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Hypertension Management': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Metabolic Syndrome': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Cardiovascular Risk': 'bg-risk-highDim text-risk-high border-risk-high/20',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Clinical Guidelines" subtitle="Evidence-based references used by the AI system" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input className="input pl-9" placeholder="Search guidelines..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <LoadingPage /> : guidelines.length === 0 ? <EmptyState icon={BookOpen} title="No guidelines found" description="Try a different search." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map(g => (
            <div key={g.id} onClick={() => navigate(`/guidelines/${g.id}`)}
              className="card p-5 cursor-pointer hover:border-accent-primary/40 transition-all group border border-bg-border">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-display font-semibold px-2.5 py-1 rounded-full border ${catColors[g.category] || 'bg-bg-elevated text-text-secondary border-bg-border'}`}>{g.category}</span>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
              </div>
              <p className="font-display font-semibold text-text-primary">{g.title}</p>
              <p className="text-text-muted text-xs font-body mt-1.5">{g.sourceOrg} · {new Date(g.publicationDate).getFullYear()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── GUIDELINE VIEWER ──────────────────────────────────────────────────────────
export function GuidelineViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guideline, setGuideline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guidelineService.get(id).then(r => setGuideline(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!guideline) return null;

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title={guideline.title}
        subtitle={`${guideline.sourceOrg} · Published ${new Date(guideline.publicationDate).toLocaleDateString()}`}
        actions={<button onClick={() => navigate('/guidelines')} className="btn-ghost">Back</button>}
      />
      <div className="card p-6">
        <p className="text-text-secondary font-body leading-relaxed whitespace-pre-wrap">{guideline.contentText || 'Full guideline content not available in this demo.'}</p>
      </div>
    </div>
  );
}

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
export function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditService.list().then(r => setLogs(r.data.logs)).finally(() => setLoading(false));
  }, []);

  const actionColors = {
    LOGIN: 'bg-blue-500/10 text-blue-400',
    ASSESSMENT_SUBMITTED: 'bg-accent-dim text-accent-primary',
    PREDICTION_GENERATED: 'bg-purple-500/10 text-purple-400',
    RECOMMENDATION_GENERATED: 'bg-risk-moderateDim text-risk-moderate',
    NURSE_DECISION_RECORDED: 'bg-risk-lowDim text-risk-low',
    PATIENT_REGISTERED: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Full system activity trail" />
      {loading ? <LoadingPage /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                {['Timestamp', 'User', 'Patient', 'Action', 'IP'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-text-muted text-xs font-display uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-bg-border last:border-0 hover:bg-bg-elevated transition-colors">
                  <td className="px-5 py-3 text-text-muted text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3 text-text-primary text-sm font-display font-medium">{log.user?.fullName || '—'}<span className="text-text-muted font-mono text-xs ml-1">({log.user?.staffId})</span></td>
                  <td className="px-5 py-3 text-text-secondary text-sm font-body">{log.patient?.fullName || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded-md ${actionColors[log.actionType] || 'bg-bg-elevated text-text-muted'}`}>{log.actionType.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-5 py-3 text-text-muted text-xs font-mono">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── REPORTS PAGE ──────────────────────────────────────────────────────────────
export function ClinicalReportsPage() {
  const [distribution, setDistribution] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.getRiskDistribution(), reportService.getHighRiskPatients()])
      .then(([d, h]) => { setDistribution(d.data); setHighRisk(h.data); })
      .finally(() => setLoading(false));
  }, []);

  const COLORS = { HIGH: '#ef4444', MODERATE: '#f59e0b', LOW: '#00e5a0' };
  const pieData = distribution.map(d => ({ name: d.riskCategory, value: d._count.riskCategory }));

  return (
    <div className="space-y-6">
      <PageHeader title="Clinical Reports" subtitle="System-wide analytics and patient risk overview" />
      {loading ? <LoadingPage /> : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="section-title mb-4">Risk Distribution</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name] || '#8892a4'} fillOpacity={0.85} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e2330', border: '1px solid #252a38', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="section-title mb-4">Patients by Category</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData}>
                    <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e2330', border: '1px solid #252a38', borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name] || '#8892a4'} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">High Risk Patients</h3>
            <div className="space-y-2">
              {highRisk.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-risk-highDim border border-risk-high/20 rounded-xl">
                  <div>
                    <p className="font-display font-semibold text-text-primary text-sm">{p.assessment?.patient?.fullName}</p>
                    <p className="text-text-muted text-xs font-mono">{p.assessment?.patient?.patientId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-risk-high font-display font-bold text-sm">CV: {Math.round((p.cvRiskScore || 0) * 100)}%</p>
                    <p className="text-text-muted text-xs font-body">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── USER PROFILE ──────────────────────────────────────────────────────────────
export function UserProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getMe().then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  const handlePw = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword(pwForm);
      setPwMsg('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" subtitle="Account information and settings" />
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-accent-dim flex items-center justify-center text-accent-primary font-display font-bold text-3xl">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-text-primary">{profile?.fullName}</h2>
            <p className="text-text-secondary font-body">{profile?.role} · {profile?.department}</p>
            <p className="text-text-muted font-mono text-sm mt-1">{profile?.staffId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Assessments', profile?._count?.assessments ?? 0],
            ['Decisions Recorded', profile?._count?.decisions ?? 0],
            ['Member Since', new Date(profile?.createdAt).toLocaleDateString()],
            ['Email', profile?.email || '—'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 bg-bg-elevated rounded-xl">
              <p className="text-text-muted text-xs font-display uppercase tracking-wider">{k}</p>
              <p className="text-text-primary font-display font-semibold mt-1">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title mb-5">Change Password</h3>
        {pwMsg && <Alert type={pwMsg.includes('success') ? 'success' : 'error'} message={pwMsg} className="mb-4" />}
        <form onSubmit={handlePw} className="space-y-4">
          <div><label className="label">Current Password</label><input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required /></div>
          <div><label className="label">New Password</label><input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required /></div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
}

// ── USER MANAGEMENT (ADMIN) ───────────────────────────────────────────────────
export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ staffId: '', fullName: '', role: 'NURSE', department: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService.list().then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.create(newUser);
      setUsers(u => [res.data, ...u]);
      setShowForm(false);
    } catch (e) {}
    finally { setSaving(false); }
  };

  const roleColors = { NURSE: 'text-accent-primary bg-accent-dim', PHYSICIAN: 'text-blue-400 bg-blue-500/10', DOCTOR: 'text-purple-400 bg-purple-500/10', ADMIN: 'text-orange-400 bg-orange-500/10' };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} staff accounts`}
        actions={<button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add User</button>}
      />
      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          <h3 className="font-display font-semibold text-text-primary">New Staff Account</h3>
          <div className="grid grid-cols-2 gap-4">
            {[['staffId', 'Staff ID'], ['fullName', 'Full Name'], ['department', 'Department'], ['email', 'Email']].map(([k, l]) => (
              <div key={k}><label className="label">{l}</label><input className="input" value={newUser[k]} onChange={e => setNewUser(u => ({ ...u, [k]: e.target.value }))} required={k !== 'email'} /></div>
            ))}
            <div><label className="label">Role</label>
              <select className="input" value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                {['NURSE', 'PHYSICIAN', 'DOCTOR', 'ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Password</label><input className="input" type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} placeholder="Default@1234" /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <LoadingPage /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                {['Staff', 'Role', 'Department', 'Email', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-text-muted text-xs font-display uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-bg-border last:border-0 hover:bg-bg-elevated transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-display font-semibold text-text-primary text-sm">{u.fullName}</p>
                    <p className="font-mono text-xs text-text-muted">{u.staffId}</p>
                  </td>
                  <td className="px-5 py-3"><span className={`text-xs font-display font-semibold px-2 py-0.5 rounded-md ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td className="px-5 py-3 text-text-secondary text-sm font-body">{u.department || '—'}</td>
                  <td className="px-5 py-3 text-text-muted text-sm font-body">{u.email || '—'}</td>
                  <td className="px-5 py-3"><span className={`w-2 h-2 rounded-full inline-block ${u.isActive ? 'bg-risk-low' : 'bg-text-muted'}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export function SystemSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="System Settings" subtitle="AI thresholds, alerts, and model configuration" />
      <div className="card p-6 space-y-5">
        <h3 className="section-title">Prediction Thresholds</h3>
        {[
          ['High Risk Threshold', '65', '%'],
          ['Moderate Risk Threshold', '40', '%'],
          ['Confidence Minimum', '70', '%'],
        ].map(([label, val, unit]) => (
          <div key={label} className="flex items-center justify-between">
            <div>
              <p className="font-display font-medium text-text-primary text-sm">{label}</p>
              <p className="text-text-muted text-xs font-body">Predictions below this trigger alerts</p>
            </div>
            <div className="flex items-center gap-2">
              <input className="input w-20 text-center" defaultValue={val} />
              <span className="text-text-muted font-body text-sm">{unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h3 className="section-title mb-4">Model Information</h3>
        {[
          ['ML Model', 'Random Forest v2.1.0'],
          ['Explainability', 'SHAP TreeExplainer'],
          ['LLM + RAG', 'GPT-4 + ChromaDB'],
          ['Last Trained', 'January 2026'],
          ['AI Service', process.env.AI_SERVICE_URL || 'http://localhost:5001'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center py-2 border-b border-bg-border last:border-0">
            <span className="text-text-muted text-sm font-body">{k}</span>
            <span className="text-text-primary font-mono text-sm">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
