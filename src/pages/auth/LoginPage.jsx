import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '../../services/authService';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ staffId: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form.staffId, form.password);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1a12 0%, #0f2318 50%, #0d1a12 100%)' }}>
        {/* Decorative glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #39d98a 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #39d98a 0%, transparent 70%)' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#39d98a 1px, transparent 1px), linear-gradient(90deg, #39d98a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-green flex items-center justify-center shadow-glow">
              <Activity size={20} className="text-bg-primary" />
            </div>
            <span className="font-display font-bold text-text-primary text-lg">ClinicalAI</span>
          </div>

          <div>
            <div className="inline-block bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              AI-Powered Clinical Support
            </div>
            <h1 className="font-display text-5xl font-bold text-text-primary leading-tight mb-4">
              Smarter<br />
              <span className="text-accent-green">Decisions.</span><br />
              Better Care.
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-sm">
              Explainable machine learning meets clinical expertise. Empower your nurses with transparent, guideline-driven AI recommendations.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[['Random Forest', 'Risk Prediction'], ['SHAP', 'Explainability'], ['LLM + RAG', 'Recommendations']].map(([tech, label]) => (
              <div key={tech} className="bg-bg-card/40 border border-bg-border rounded-xl p-3">
                <p className="text-accent-green text-sm font-mono font-medium">{tech}</p>
                <p className="text-text-muted text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-accent-green flex items-center justify-center shadow-glow">
              <Activity size={18} className="text-bg-primary" />
            </div>
            <span className="font-display font-bold text-text-primary">ClinicalAI</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-secondary mb-8">Sign in with your staff credentials to continue</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-risk-high/10 border border-risk-high/30 text-risk-high rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Staff ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. NURSE001"
                value={form.staffId}
                onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <><div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-bg-card border border-bg-border rounded-xl">
            <p className="text-text-muted text-xs font-medium mb-2">Demo credentials:</p>
            <div className="space-y-1">
              {[['Admin', 'ADMIN001', 'Admin@123'], ['Nurse', 'NURSE001', 'Nurse@123'], ['Physician', 'PHYS001', 'Doctor@123']].map(([role, id, pw]) => (
                <button key={role} onClick={() => setForm({ staffId: id, password: pw })}
                  className="w-full text-left text-xs text-text-secondary hover:text-accent-green transition-colors font-mono">
                  {role}: {id} / {pw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
