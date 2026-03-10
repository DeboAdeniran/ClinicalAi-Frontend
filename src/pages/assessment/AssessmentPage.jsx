import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Search } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import { createAssessment } from '../../services/assessmentService';
import { generatePrediction } from '../../services/predictionService';
import { listPatients } from '../../services/patientService';

const F = ({ label, children, hint }) => (
  <div>
    <label className="label">{label}{hint && <span className="text-text-muted ml-1 font-normal text-xs">({hint})</span>}</label>
    {children}
  </div>
);

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(sp.get('patientId') || '');
  const [patientSearch, setPatientSearch] = useState('');
  const [form, setForm] = useState({
    bpSystolic: '', bpDiastolic: '', heartRate: '', hba1c: '', fastingGlucose: '',
    bmi: '', waistCm: '', cholesterol: '', triglycerides: '', creatinine: '',
    lifestyleNotes: '', comments: '',
  });

  useEffect(() => {
    listPatients({ search: patientSearch }).then(r => setPatients(r.data || [])).catch(() => {});
  }, [patientSearch]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const num = (v) => v ? parseFloat(v) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return alert('Please select a patient');
    setLoading(true);
    try {
      const assessment = await createAssessment({
        patientId,
        bpSystolic: num(form.bpSystolic), bpDiastolic: num(form.bpDiastolic),
        heartRate: num(form.heartRate), hba1c: num(form.hba1c),
        fastingGlucose: num(form.fastingGlucose), bmi: num(form.bmi),
        waistCm: num(form.waistCm), cholesterol: num(form.cholesterol),
        triglycerides: num(form.triglycerides), creatinine: num(form.creatinine),
        lifestyleNotes: form.lifestyleNotes, comments: form.comments,
      });
      const prediction = await generatePrediction(assessment.data.id);
      navigate(`/predictions/${prediction.data.id}`);
    } catch (err) {
      alert(err.message || 'Failed to submit assessment');
    } finally { setLoading(false); }
  };

  const selectedPatient = patients.find(p => p.id === patientId);

  return (
    <PageLayout>
      <PageHeader title="Clinical Assessment" subtitle="Record vital signs and clinical measurements"
        actions={<button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 text-sm"><ArrowLeft size={15} /> Back</button>} />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        {/* Patient selector */}
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-3">Select Patient</h3>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-field pl-9" placeholder="Search patients..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
          </div>
          {selectedPatient && (
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg px-3 py-2 mb-3 text-sm">
              <span className="text-accent-green font-medium">Selected: </span>
              <span className="text-text-primary">{selectedPatient.fullName} — {selectedPatient.patientId}</span>
            </div>
          )}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {patients.slice(0, 8).map(p => (
              <div key={p.id} onClick={() => setPatientId(p.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${patientId === p.id ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-bg-secondary hover:bg-bg-border'}`}>
                <span className="text-text-primary truncate">{p.fullName}</span>
                <span className="text-text-muted font-mono text-xs ml-2 shrink-0">{p.patientId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-4">Vital Signs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <F label="Systolic BP" hint="mmHg"><input type="number" className="input-field" value={form.bpSystolic} onChange={e => set('bpSystolic', e.target.value)} placeholder="130" /></F>
            <F label="Diastolic BP" hint="mmHg"><input type="number" className="input-field" value={form.bpDiastolic} onChange={e => set('bpDiastolic', e.target.value)} placeholder="85" /></F>
            <F label="Heart Rate" hint="bpm"><input type="number" className="input-field" value={form.heartRate} onChange={e => set('heartRate', e.target.value)} placeholder="78" /></F>
          </div>
        </div>

        {/* Diabetes */}
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-4">Diabetes Indicators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="HbA1c" hint="%"><input type="number" step="0.1" className="input-field" value={form.hba1c} onChange={e => set('hba1c', e.target.value)} placeholder="7.8" /></F>
            <F label="Fasting Blood Glucose" hint="mg/dL"><input type="number" className="input-field" value={form.fastingGlucose} onChange={e => set('fastingGlucose', e.target.value)} placeholder="130" /></F>
          </div>
        </div>

        {/* Metabolic */}
        <div className="card p-4 lg:p-5">
          <h3 className="section-title mb-4">Metabolic Indicators</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <F label="BMI" hint="kg/m²"><input type="number" step="0.1" className="input-field" value={form.bmi} onChange={e => set('bmi', e.target.value)} placeholder="28.5" /></F>
            <F label="Waist" hint="cm"><input type="number" className="input-field" value={form.waistCm} onChange={e => set('waistCm', e.target.value)} placeholder="95" /></F>
            <F label="Cholesterol" hint="mg/dL"><input type="number" className="input-field" value={form.cholesterol} onChange={e => set('cholesterol', e.target.value)} placeholder="210" /></F>
            <F label="Triglycerides" hint="mg/dL"><input type="number" className="input-field" value={form.triglycerides} onChange={e => set('triglycerides', e.target.value)} placeholder="170" /></F>
          </div>
        </div>

        {/* Additional */}
        <div className="card p-4 lg:p-5 space-y-4">
          <h3 className="section-title">Additional</h3>
          <F label="Creatinine" hint="mg/dL"><input type="number" step="0.01" className="input-field sm:max-w-xs" value={form.creatinine} onChange={e => set('creatinine', e.target.value)} placeholder="1.0" /></F>
          <F label="Lifestyle Notes"><textarea className="input-field h-20 resize-none" value={form.lifestyleNotes} onChange={e => set('lifestyleNotes', e.target.value)} placeholder="Lifestyle observations..." /></F>
          <F label="Clinical Comments"><textarea className="input-field h-20 resize-none" value={form.comments} onChange={e => set('comments', e.target.value)} placeholder="Nurse's observations..." /></F>
        </div>

        <div className="bg-accent-green/5 border border-accent-green/20 rounded-xl p-4 text-sm text-text-secondary flex items-start gap-3">
          <div className="w-4 h-4 rounded-full bg-accent-green/20 flex items-center justify-center mt-0.5 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-accent-green" /></div>
          <p className="text-xs sm:text-sm">Submitting will automatically trigger AI risk prediction. Results are available immediately.</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60 w-full sm:w-auto justify-center">
          {loading ? <><div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" /> Running AI...</> : <><Send size={15} /> Submit & Generate Prediction</>}
        </button>
      </form>
    </PageLayout>
  );
}
