import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { predictionService } from '../../services/predictionService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';

const LABELS = {
  hba1c: 'HbA1c', bp_systolic: 'Systolic BP', bmi: 'BMI', age: 'Age',
  fasting_glucose: 'Fasting Glucose', cholesterol_total: 'Total Cholesterol',
  on_bp_medication: 'BP Medication', physical_activity: 'Physical Activity',
  triglycerides: 'Triglycerides', creatinine: 'Creatinine'
};

export default function PredictionExplanationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictionService.getExplanation(id)
      .then(r => setExplanation(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" text="Generating explanation..." /></div>;

  const impacts = explanation?.feature_impacts ? Object.entries(
    typeof explanation.feature_impacts === 'string' ? JSON.parse(explanation.feature_impacts) : explanation.feature_impacts
  ).map(([key, val]) => ({ name: LABELS[key] || key, value: parseFloat(val), positive: parseFloat(val) > 0 }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10) : [];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const v = payload[0].value;
    return (
      <div className="bg-bg-elevated border border-bg-border rounded-xl p-3 shadow-card">
        <p className="text-text-primary text-xs font-semibold mb-1">{payload[0].payload.name}</p>
        <p className={`font-mono text-sm font-bold ${v > 0 ? 'text-risk-high' : 'text-accent'}`}>
          {v > 0 ? '+' : ''}{v.toFixed(3)} impact
        </p>
        <p className="text-text-muted text-xs mt-1">{v > 0 ? 'Increases risk' : 'Reduces risk'}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-6">
      <PageHeader
        title="AI Prediction Explanation"
        subtitle="SHAP-based explanation of what drove this risk prediction"
        actions={
          <button onClick={() => navigate(`/predictions/${id}`)} className="btn-ghost"><ArrowLeft size={15} /> Back to Results</button>
        }
      />

      {/* Narrative */}
      {explanation?.narrative_explanation && (
        <div className="card border-accent/20" style={{ boxShadow: '0 0 24px rgba(0,200,150,0.08)' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center flex-shrink-0">
              <Brain size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-accent text-xs font-semibold mb-2 uppercase tracking-wider">AI Narrative Summary</p>
              <p className="text-text-primary text-sm leading-relaxed">{explanation.narrative_explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* SHAP chart */}
      {impacts.length > 0 && (
        <div className="card">
          <h3 className="text-text-primary font-semibold text-sm mb-2">Feature Impact on Risk Score</h3>
          <p className="text-text-muted text-xs mb-6">Positive values increase risk, negative values reduce risk</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={impacts} layout="vertical" margin={{ top: 0, right: 30, left: 120, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8B8BA7', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8B8BA7', fontSize: 11 }} axisLine={false} tickLine={false} width={115} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {impacts.map((entry, i) => (
                  <Cell key={i} fill={entry.positive ? '#FF4757' : '#00C896'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4 justify-end">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-risk-high opacity-85" /><span className="text-text-muted text-xs">Increases risk</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent opacity-85" /><span className="text-text-muted text-xs">Reduces risk</span></div>
          </div>
        </div>
      )}

      {/* Key factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-risk-high font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Top Risk Factors
          </h3>
          <div className="space-y-2">
            {(explanation?.top_contributors ? (typeof explanation.top_contributors === 'string' ? JSON.parse(explanation.top_contributors) : explanation.top_contributors) : []).map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-risk-high-muted rounded-xl px-3 py-2">
                <div className="w-5 h-5 rounded-lg bg-risk-high/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-risk-high text-xs font-bold">{i+1}</span>
                </div>
                <span className="text-text-secondary text-sm capitalize">{LABELS[f] || f.replace(/_/g,' ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-accent font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingDown size={14} /> Protective Factors
          </h3>
          <div className="space-y-2">
            {(explanation?.top_protective ? (typeof explanation.top_protective === 'string' ? JSON.parse(explanation.top_protective) : explanation.top_protective) : []).map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-accent-muted rounded-xl px-3 py-2">
                <div className="w-5 h-5 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent text-xs font-bold">{i+1}</span>
                </div>
                <span className="text-text-secondary text-sm capitalize">{LABELS[f] || f.replace(/_/g,' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
