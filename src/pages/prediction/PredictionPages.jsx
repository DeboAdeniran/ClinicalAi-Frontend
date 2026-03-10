import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, FileText, ChevronRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { predictionService, recommendationService } from '../../services/api';
import { RiskBadge, LoadingPage, PageHeader, MockBanner, Alert } from '../../components/common';

// ── RISK RESULTS ─────────────────────────────────────────────────────────────
export function RiskResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    predictionService.get(id).then(r => setPrediction(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleGenerateRec = async () => {
    setGenerating(true);
    try {
      const res = await recommendationService.generate(id);
      navigate(`/recommendations/${res.data.id}`);
    } catch (e) {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingPage />;
  if (!prediction) return null;

  const patient = prediction.assessment?.patient;
  const scores = [
    { name: 'Cardiovascular', value: Math.round((prediction.cvRiskScore || 0) * 100), color: '#ef4444' },
    { name: 'Diabetes Progression', value: Math.round((prediction.diabetesRiskScore || 0) * 100), color: '#f59e0b' },
    { name: 'Hypertension Complication', value: Math.round((prediction.htnRiskScore || 0) * 100), color: '#3b82f6' },
  ];

  const categoryColor = { HIGH: '#ef4444', MODERATE: '#f59e0b', LOW: '#00e5a0' }[prediction.riskCategory];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Risk Prediction Results"
        subtitle={patient ? `${patient.fullName} · ${patient.patientId}` : ''}
        actions={
          <div className="flex gap-3 items-center">
            {prediction.isMock && <MockBanner />}
            <button onClick={() => navigate(`/predictions/${id}/explanation`)} className="btn-ghost flex items-center gap-2">
              <Brain className="w-4 h-4" /> Explain
            </button>
            {!prediction.recommendations?.length && (
              <button onClick={handleGenerateRec} disabled={generating} className="btn-primary flex items-center gap-2">
                {generating ? 'Generating...' : <><FileText className="w-4 h-4" /> Generate Recommendation</>}
              </button>
            )}
            {prediction.recommendations?.length > 0 && (
              <button onClick={() => navigate(`/recommendations/${prediction.recommendations[0].id}`)} className="btn-primary flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Recommendation
              </button>
            )}
          </div>
        }
      />

      {/* Overall risk */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-text-muted text-xs font-display uppercase tracking-wider">Overall Risk Category</p>
            <div className="flex items-center gap-3 mt-2">
              <RiskBadge category={prediction.riskCategory} />
              <span className="text-text-secondary font-body text-sm">
                Model confidence: <span className="text-text-primary font-display font-semibold">{Math.round((prediction.confidenceScore || 0) * 100)}%</span>
              </span>
            </div>
          </div>
          {prediction.riskCategory === 'HIGH' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-risk-highDim border border-risk-high/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-risk-high" />
              <span className="text-risk-high text-sm font-display font-semibold">Immediate attention required</span>
            </div>
          )}
        </div>

        {/* Score bars */}
        <div className="space-y-4">
          {scores.map(s => (
            <div key={s.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-text-secondary text-sm font-body">{s.name} Risk</span>
                <span className="font-display font-bold text-sm" style={{ color: s.color }}>{s.value}%</span>
              </div>
              <div className="h-2.5 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.value}%`, backgroundColor: s.color, opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score chart */}
      <div className="card p-6">
        <h3 className="section-title mb-4">Risk Score Breakdown</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scores} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#1e2330', border: '1px solid #252a38', borderRadius: 8, fontFamily: 'DM Sans' }} formatter={v => [`${v}%`]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {scores.map((s, i) => <Cell key={i} fill={s.color} fillOpacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model info */}
      <div className="card p-5">
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ['Model', prediction.modelVersion || 'Random Forest v1'],
            ['Generated', new Date(prediction.createdAt).toLocaleString()],
            ['Assessment ID', prediction.assessmentId?.slice(-8)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-text-muted text-xs font-display uppercase tracking-wider">{k}</p>
              <p className="text-text-primary font-mono text-sm mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EXPLANATION PAGE ──────────────────────────────────────────────────────────
export function PredictionExplanationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictionService.getExplanation(id).then(r => setExplanation(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!explanation) return <Alert type="error" message="Explanation not found" />;

  const impacts = Object.entries(explanation.featureImpacts || {})
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v, isRisk: v > 0 }));

  const maxVal = Math.max(...impacts.map(i => Math.abs(i.value)));

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="AI Explanation (SHAP)"
        subtitle="Why the model predicted this risk level"
        actions={
          <button onClick={() => navigate(`/predictions/${id}`)} className="btn-ghost flex items-center gap-2">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Results
          </button>
        }
      />

      {/* Narrative */}
      <div className="card p-6 border border-accent-primary/20 bg-accent-dim">
        <p className="text-text-secondary text-xs font-display uppercase tracking-wider mb-2">Clinical Narrative</p>
        <p className="text-text-primary font-body leading-relaxed">{explanation.narrativeExplanation}</p>
      </div>

      {/* Feature impacts */}
      <div className="card p-6">
        <h3 className="section-title mb-5">Feature Impact Analysis</h3>
        <div className="space-y-3">
          {impacts.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {item.isRisk
                    ? <TrendingUp className="w-3.5 h-3.5 text-risk-high" />
                    : <TrendingDown className="w-3.5 h-3.5 text-risk-low" />}
                  <span className="text-text-secondary text-sm font-body capitalize">{item.name}</span>
                </div>
                <span className={`font-mono text-sm font-semibold ${item.isRisk ? 'text-risk-high' : 'text-risk-low'}`}>
                  {item.isRisk ? '+' : ''}{item.value.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-bg-elevated rounded-full overflow-hidden flex">
                {!item.isRisk && <div style={{ flex: 1 }} />}
                <div className="h-full rounded-full" style={{
                  width: `${(Math.abs(item.value) / maxVal) * 50}%`,
                  backgroundColor: item.isRisk ? '#ef4444' : '#00e5a0',
                  opacity: 0.75,
                }} />
                {item.isRisk && <div style={{ flex: 1 }} />}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-bg-border text-xs text-text-muted font-body">
          <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-risk-high opacity-75" /> Increases risk</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-risk-low opacity-75" /> Reduces risk</div>
        </div>
      </div>

      {/* Top contributors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-text-muted text-xs font-display uppercase tracking-wider mb-3">Top Risk Factors</p>
          <div className="space-y-2">
            {explanation.topContributors?.map((f, i) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-risk-highDim text-risk-high text-xs flex items-center justify-center font-display font-bold">{i + 1}</span>
                <span className="text-text-primary text-sm font-body capitalize">{f.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <p className="text-text-muted text-xs font-display uppercase tracking-wider mb-3">Protective Factors</p>
          <div className="space-y-2">
            {explanation.protectiveFactors?.map((f, i) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-risk-lowDim text-risk-low text-xs flex items-center justify-center font-display font-bold">{i + 1}</span>
                <span className="text-text-primary text-sm font-body capitalize">{f.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
