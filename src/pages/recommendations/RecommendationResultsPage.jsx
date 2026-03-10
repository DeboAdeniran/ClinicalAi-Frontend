import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, ClipboardCheck, Pill, Heart, Calendar, Shield } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRecommendation, recordDecision, submitFeedback } from '../../services/recommendationService';
import { formatDateTime } from '../../utils/formatters';

export default function RecommendationResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState({ decisionType: '', notes: '' });
  const [feedback, setFeedback] = useState({ rating: '', comments: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getRecommendation(id).then(r => setRec(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async () => {
    if (!decision.decisionType) return alert('Please select a decision type');
    setSaving(true);
    try {
      await recordDecision({ recommendationId: id, ...decision });
      if (feedback.rating) await submitFeedback({ recommendationId: id, ...feedback });
      setSaved(true);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) { alert(err.message || 'Failed to record decision'); } finally { setSaving(false); }
  };

  if (loading) return <PageLayout><LoadingSpinner size="lg" /></PageLayout>;
  if (!rec) return <PageLayout><p className="text-text-muted">Recommendation not found</p></PageLayout>;

  const val = rec.validationResult;
  const tx = rec.treatmentSuggestions || {};
  const cp = rec.carePlan || {};
  const complianceColor = { COMPLIANT: '#39d98a', PARTIAL: '#ffa502', RISK_DETECTED: '#ff4757' }[val?.complianceStatus] || '#8b93a7';

  const TxSection = ({ icon: Icon, title, color, items }) => (
    <div className="card p-4">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color }}><Icon size={14} />{title}</h4>
      <ul className="space-y-2">
        {(items || []).map((m, i) => (
          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
            <span className="text-text-secondary">{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <PageLayout>
      <div className="flex items-start gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-bg-card transition-colors mt-0.5 shrink-0"><ArrowLeft size={17} className="text-text-secondary" /></button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">AI Recommendation</h1>
            {rec.isMock && <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">Mock AI</span>}
            {val && <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: complianceColor, borderColor: `${complianceColor}40`, background: `${complianceColor}15` }}>{val.complianceStatus}</span>}
          </div>
          <p className="text-text-muted text-xs mt-0.5">{formatDateTime(rec.createdAt)} • {rec.llmModelVersion}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rationale */}
        <div className="card p-4 lg:p-5 border-l-2 border-accent-green">
          <p className="text-xs text-accent-green font-semibold mb-2">CLINICAL RATIONALE</p>
          <p className="text-text-secondary text-sm leading-relaxed">{rec.clinicalRationale}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {rec.guidelineRefs?.map(ref => (
              <span key={ref} className="bg-bg-secondary border border-bg-border text-text-muted text-xs px-2 py-0.5 rounded font-mono">{ref}</span>
            ))}
          </div>
        </div>

        {/* Treatment sections — 1 col mobile, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <TxSection icon={Pill} title="Medication Considerations" color="#a78bfa" items={tx.medication} />
          <TxSection icon={Heart} title="Lifestyle Interventions" color="#ff4757" items={tx.lifestyle} />
          <TxSection icon={Calendar} title="Monitoring Plan" color="#60a5fa" items={tx.monitoring} />
        </div>

        {/* Care plan */}
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-3">Care Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[['Dietary Guidance', cp.dietary_guidance], ['Physical Activity', cp.physical_activity], ['Follow-Up', cp.follow_up]].map(([label, text]) => (
              <div key={label} className="bg-bg-secondary rounded-lg p-3">
                <p className="text-text-muted text-xs font-medium mb-1">{label}</p>
                <p className="text-text-secondary text-xs sm:text-sm">{text || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Validation */}
        {val && (
          <div className="card p-4 lg:p-5">
            <h3 className="section-title mb-3 flex items-center gap-2"><Shield size={15} className="text-accent-green" /> Safety Validation</h3>
            <div className="mb-3">
              {val.overallSafe
                ? <div className="flex items-center gap-2 text-accent-green text-sm"><CheckCircle size={15} /> Overall: Safe to proceed</div>
                : <div className="flex items-center gap-2 text-risk-high text-sm"><XCircle size={15} /> Safety concerns detected</div>}
            </div>
            {val.safetyChecks?.contraindications?.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-risk-moderate font-semibold mb-1">Contraindications</p>
                {val.safetyChecks.contraindications.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs mb-1"><AlertCircle size={12} className="text-risk-moderate mt-0.5 shrink-0" /><span className="text-text-secondary">{c}</span></div>
                ))}
              </div>
            )}
            {val.suggestedCorrections?.length > 0 && (
              <div>
                <p className="text-xs text-accent-green font-semibold mb-1">Suggested Corrections</p>
                {val.suggestedCorrections.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs mb-1"><CheckCircle size={12} className="text-accent-green mt-0.5 shrink-0" /><span className="text-text-secondary">{c}</span></div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Decision panel */}
        {!rec.nurseDecision && !saved ? (
          <div className="card p-4 lg:p-5">
            <h3 className="section-title mb-4 flex items-center gap-2"><ClipboardCheck size={15} className="text-accent-green" /> Record Your Decision</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['ACCEPTED', 'MODIFIED', 'ESCALATED'].map(type => (
                <button key={type} onClick={() => setDecision(d => ({ ...d, decisionType: type }))}
                  className={`py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${decision.decisionType === type ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-secondary border-bg-border text-text-secondary hover:border-text-muted'}`}>
                  {type === 'ACCEPTED' ? '✓ Accept' : type === 'MODIFIED' ? '✏ Modify' : '⬆ Escalate'}
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="label">Nurse Notes</label>
                <textarea className="input-field h-20 resize-none text-sm" value={decision.notes} onChange={e => setDecision(d => ({ ...d, notes: e.target.value }))} placeholder="Your clinical observations..." />
              </div>
            </div>
            <div className="border-t border-bg-border pt-4">
              <p className="text-text-muted text-xs font-medium mb-2">Feedback (optional)</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {['USEFUL', 'PARTIALLY_USEFUL', 'NOT_USEFUL'].map(r => (
                  <button key={r} onClick={() => setFeedback(f => ({ ...f, rating: r }))}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${feedback.rating === r ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-secondary border-bg-border text-text-secondary'}`}>
                    {r.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <textarea className="input-field h-16 resize-none text-sm" value={feedback.comments} onChange={e => setFeedback(f => ({ ...f, comments: e.target.value }))} placeholder="Feedback comments..." />
            </div>
            <button onClick={handleDecision} disabled={saving} className="btn-primary flex items-center gap-2 mt-4 disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" /> Saving...</> : <><ClipboardCheck size={15} /> Record Decision</>}
            </button>
          </div>
        ) : saved ? (
          <div className="card p-4 border-accent-green/30">
            <div className="flex items-center gap-3 text-accent-green"><CheckCircle size={18} /><span className="font-medium text-sm">Decision recorded. Redirecting...</span></div>
          </div>
        ) : (
          <div className="card p-4">
            <p className="text-text-muted text-sm flex items-center gap-2"><CheckCircle size={15} className="text-accent-green" /> Decision recorded: <span className="text-accent-green font-medium">{rec.nurseDecision.decisionType}</span></p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
