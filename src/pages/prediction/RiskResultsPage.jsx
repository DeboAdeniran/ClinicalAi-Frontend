import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Lightbulb, TrendingUp, Shield } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import PageLayout from '../../components/layout/PageLayout';
import { RiskBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPrediction } from '../../services/predictionService';
import { generateRecommendation } from '../../services/recommendationService';
import { formatDateTime } from '../../utils/formatters';

const RiskBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1.5">
      <span className="text-text-secondary text-xs sm:text-sm">{label}</span>
      <span className="font-medium text-xs sm:text-sm" style={{ color }}>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value * 100}%`, background: color }} />
    </div>
  </div>
);

export default function RiskResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    getPrediction(id).then(r => setPrediction(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleGenerateRec = async () => {
    setGenLoading(true);
    try {
      const res = await generateRecommendation(id);
      navigate(`/recommendations/${res.data.id}`);
    } catch (err) { alert(err.message || 'Failed to generate recommendation'); } finally { setGenLoading(false); }
  };

  if (loading) return <PageLayout><LoadingSpinner size="lg" /></PageLayout>;
  if (!prediction) return <PageLayout><p className="text-text-muted">Prediction not found</p></PageLayout>;

  const p = prediction;
  const catColor = { HIGH: '#ff4757', MODERATE: '#ffa502', LOW: '#39d98a' }[p.riskCategory] || '#39d98a';
  const radarData = [
    { subject: 'CV', value: Math.round(p.cvRiskScore * 100) },
    { subject: 'Diabetes', value: Math.round(p.diabetesRiskScore * 100) },
    { subject: 'HTN', value: Math.round(p.htnRiskScore * 100) },
    { subject: 'Confidence', value: Math.round(p.confidenceScore * 100) },
  ];
  const shap = p.shapExplanation;

  return (
    <PageLayout>
      <div className="flex items-start gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-bg-card transition-colors mt-0.5 shrink-0"><ArrowLeft size={17} className="text-text-secondary" /></button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">Risk Prediction</h1>
            <RiskBadge category={p.riskCategory} />
            {p.isMock && <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">Mock AI</span>}
          </div>
          <p className="text-text-muted text-xs mt-0.5">{formatDateTime(p.createdAt)} • {p.modelVersion}</p>
        </div>
      </div>

      {/* Risk scores + radar — stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 card p-5">
          <h3 className="section-title mb-5">Risk Scores</h3>
          <div className="space-y-4">
            <RiskBar label="Cardiovascular Risk" value={p.cvRiskScore} color="#ff4757" />
            <RiskBar label="Diabetes Progression" value={p.diabetesRiskScore} color="#ffa502" />
            <RiskBar label="Hypertension Complication" value={p.htnRiskScore} color="#60a5fa" />
          </div>
          <div className="mt-5 pt-4 border-t border-bg-border flex items-center justify-between">
            <div>
              <p className="text-text-muted text-xs">Overall Category</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-display font-bold" style={{ color: catColor }}>{p.riskCategory}</span>
                <span className="text-text-muted text-sm">RISK</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-xs">Confidence</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-accent-green">{Math.round(p.confidenceScore * 100)}%</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-2">Risk Profile</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#252a38" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b93a7', fontSize: 10 }} />
              <Radar dataKey="value" stroke={catColor} fill={catColor} fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHAP Explanation */}
      {shap && (
        <div className="card p-4 lg:p-6 mb-5">
          <h3 className="section-title mb-2 flex items-center gap-2"><Brain size={16} className="text-accent-green" /> AI Explanation (SHAP)</h3>
          <p className="text-text-secondary text-sm mb-4 bg-bg-secondary rounded-lg px-4 py-3 border-l-2 border-accent-green leading-relaxed">{shap.narrativeExplanation}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-risk-high mb-3 flex items-center gap-1.5"><TrendingUp size={12} /> Top Risk Contributors</p>
              <div className="space-y-2">
                {Object.entries(shap.featureImpacts).filter(([,v]) => v > 0).sort(([,a],[,b]) => b - a).map(([feature, impact]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-20 sm:w-24 text-right text-xs text-text-muted capitalize shrink-0">{feature.replace(/_/g, ' ')}</div>
                    <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-risk-high" style={{ width: `${Math.min(impact * 400, 100)}%` }} />
                    </div>
                    <span className="text-xs text-risk-high font-mono w-10 text-right shrink-0">+{impact.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-green mb-3 flex items-center gap-1.5"><Shield size={12} /> Protective Factors</p>
              <div className="space-y-2">
                {Object.entries(shap.featureImpacts).filter(([,v]) => v < 0).sort(([,a],[,b]) => a - b).map(([feature, impact]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-20 sm:w-24 text-right text-xs text-text-muted capitalize shrink-0">{feature.replace(/_/g, ' ')}</div>
                    <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent-green" style={{ width: `${Math.min(Math.abs(impact) * 400, 100)}%` }} />
                    </div>
                    <span className="text-xs text-accent-green font-mono w-10 text-right shrink-0">{impact.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={handleGenerateRec} disabled={genLoading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {genLoading ? <><div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" /> Generating...</> : <><Lightbulb size={15} /> Generate Recommendation</>}
        </button>
        <button onClick={() => navigate(`/patients/${p.assessment?.patientId}`)} className="btn-secondary text-sm">View Patient</button>
      </div>
    </PageLayout>
  );
}
