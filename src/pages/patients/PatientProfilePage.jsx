import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, User, Pill, Activity, Brain } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { RiskBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPatient } from '../../services/patientService';
import { formatDate, formatDateTime } from '../../utils/formatters';

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    getPatient(id).then(r => setPatient(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLayout><LoadingSpinner size="lg" /></PageLayout>;
  if (!patient) return <PageLayout><p className="text-text-muted">Patient not found</p></PageLayout>;

  const latestRisk = patient.riskPredictions?.[0];

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/patients')} className="p-2 rounded-lg hover:bg-bg-card transition-colors shrink-0"><ArrowLeft size={17} className="text-text-secondary" /></button>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
            <User size={20} className="text-accent-green" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="page-title truncate">{patient.fullName}</h1>
              {latestRisk && <RiskBadge category={latestRisk.riskCategory} />}
            </div>
            <p className="text-text-muted text-xs font-mono">{patient.patientId} • {patient.age}y • {patient.gender}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/assessment?patientId=${id}`)} className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto">
          <ClipboardList size={15} /> New Assessment
        </button>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 mb-5 w-full overflow-x-auto">
        {['overview', 'assessments', 'predictions', 'recommendations'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm capitalize transition-all whitespace-nowrap flex-1 sm:flex-none ${tab === t ? 'bg-bg-card text-text-primary font-medium' : 'text-text-muted hover:text-text-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-5 space-y-3">
            <h3 className="section-title flex items-center gap-2"><Activity size={15} className="text-accent-green" /> Clinical Info</h3>
            {[
              ['Age', patient.age], ['Gender', patient.gender],
              ['Contact', patient.contactPhone || patient.contactEmail || '—'],
              ['Diabetes Duration', patient.diabetesDuration ? `${patient.diabetesDuration} years` : '—'],
              ['Smoking', patient.smokingStatus || '—'], ['Alcohol', patient.alcoholUse || '—'],
              ['Physical Activity', patient.physicalActivity || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm gap-2">
                <span className="text-text-muted shrink-0">{k}</span>
                <span className="text-text-primary capitalize text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="card p-5 space-y-2">
            <h3 className="section-title flex items-center gap-2"><Brain size={15} className="text-blue-400" /> Diagnoses</h3>
            {(patient.diagnoses?.length ? patient.diagnoses : ['None recorded']).map(d => (
              <div key={d} className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" /><span className="text-text-primary">{d}</span></div>
            ))}
            <hr className="border-bg-border my-2" />
            <h4 className="text-text-secondary text-sm font-medium">Comorbidities</h4>
            {(patient.comorbidities?.length ? patient.comorbidities : ['None recorded']).map(d => (
              <div key={d} className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" /><span className="text-text-secondary">{d}</span></div>
            ))}
          </div>

          <div className="card p-5 space-y-2 sm:col-span-2 lg:col-span-1">
            <h3 className="section-title flex items-center gap-2"><Pill size={15} className="text-purple-400" /> Medications</h3>
            {(patient.medications?.length ? patient.medications : ['None recorded']).map(m => (
              <div key={m} className="bg-bg-secondary border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary">{m}</div>
            ))}
          </div>
        </div>
      )}

      {tab === 'assessments' && (
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-4">Assessment History</h3>
          {!patient.assessments?.length ? <p className="text-text-muted text-sm text-center py-8">No assessments yet</p> : (
            <div className="space-y-3">
              {patient.assessments.map(a => (
                <div key={a.id} className="bg-bg-secondary rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{formatDateTime(a.submittedAt)}</p>
                    <p className="text-text-muted text-xs mt-1">HbA1c: {a.hba1c ?? '—'} • BP: {a.bpSystolic}/{a.bpDiastolic} • BMI: {a.bmi ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.prediction && <RiskBadge category={a.prediction.riskCategory} />}
                    {a.prediction && <button onClick={() => navigate(`/predictions/${a.prediction.id}`)} className="btn-secondary text-xs px-3 py-1">View Prediction</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'predictions' && (
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-4">Risk Prediction History</h3>
          {!patient.riskPredictions?.length ? <p className="text-text-muted text-sm text-center py-8">No predictions yet</p> : (
            <div className="space-y-3">
              {patient.riskPredictions.map(p => (
                <div key={p.id} onClick={() => navigate(`/predictions/${p.id}`)}
                  className="bg-bg-secondary rounded-lg p-4 cursor-pointer hover:bg-bg-border transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <RiskBadge category={p.riskCategory} />
                    <span className="text-text-muted text-xs">Confidence: {Math.round(p.confidenceScore * 100)}%</span>
                  </div>
                  <p className="text-text-muted text-xs">CV: {(p.cvRiskScore*100).toFixed(1)}% • Diabetes: {(p.diabetesRiskScore*100).toFixed(1)}% • HTN: {(p.htnRiskScore*100).toFixed(1)}%</p>
                  <p className="text-text-muted text-xs mt-1">{formatDate(p.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'recommendations' && (
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-4">Recommendation History</h3>
          {!patient.recommendations?.length ? <p className="text-text-muted text-sm text-center py-8">No recommendations yet</p> : (
            <div className="space-y-3">
              {patient.recommendations.map(r => (
                <div key={r.id} onClick={() => navigate(`/recommendations/${r.id}`)}
                  className="bg-bg-secondary rounded-lg p-4 cursor-pointer hover:bg-bg-border transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <p className="text-text-primary text-sm font-medium">{formatDate(r.createdAt)}</p>
                    {r.validationResult && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${r.validationResult.overallSafe ? 'badge-low' : 'badge-high'}`}>
                        {r.validationResult.complianceStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs line-clamp-2">{r.clinicalRationale}</p>
                  {r.nurseDecision && <p className="text-accent-green text-xs mt-1">✓ Decision: {r.nurseDecision.decisionType}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
