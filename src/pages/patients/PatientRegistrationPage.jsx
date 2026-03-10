import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import { createPatient } from '../../services/patientService';

const Field = ({ label, children }) => (
  <div><label className="label">{label}</label>{children}</div>
);

export default function PatientRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', age: '', gender: '', contactPhone: '', contactEmail: '',
    diagnoses: [], diabetesDuration: '', medications: [], smokingStatus: '', alcoholUse: '', physicalActivity: '', comorbidities: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createPatient({ ...form, age: parseInt(form.age), diabetesDuration: parseInt(form.diabetesDuration) || null });
      navigate(`/patients/${res.data.id}`);
    } catch (err) {
      alert(err.message || 'Failed to register patient');
    } finally { setLoading(false); }
  };

  const CheckGroup = ({ label, items, field }) => (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button key={item} type="button" onClick={() => toggleArr(field, item)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-all ${form[field].includes(item) ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-secondary border-bg-border text-text-secondary hover:border-text-muted'}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader title="Register New Patient"
        actions={<button onClick={() => navigate('/patients')} className="btn-secondary flex items-center gap-2 text-sm"><ArrowLeft size={15} /> Back</button>} />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        {/* Demographics */}
        <div className="card p-4 lg:p-6">
          <h3 className="section-title mb-4">Demographic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Full Name *"><input className="input-field" required value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Patient's full name" /></Field>
            </div>
            <Field label="Age *"><input type="number" className="input-field" required value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 65" /></Field>
            <Field label="Gender *">
              <select className="input-field" required value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Phone"><input className="input-field" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+234..." /></Field>
            <Field label="Email"><input type="email" className="input-field" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="patient@email.com" /></Field>
          </div>
        </div>

        {/* Medical Background */}
        <div className="card p-4 lg:p-6 space-y-4">
          <h3 className="section-title">Medical Background</h3>
          <CheckGroup label="Diagnoses" field="diagnoses" items={['Type 2 Diabetes', 'Hypertension', 'Metabolic Syndrome', 'Dyslipidemia', 'Obesity', 'CKD']} />
          <Field label="Diabetes Duration (years)">
            <input type="number" className="input-field max-w-xs" value={form.diabetesDuration} onChange={e => set('diabetesDuration', e.target.value)} placeholder="e.g. 5" />
          </Field>
          <CheckGroup label="Comorbidities" field="comorbidities" items={['Heart Disease', 'Stroke', 'Neuropathy', 'Retinopathy', 'NAFLD', 'Sleep Apnea']} />
        </div>

        {/* Lifestyle */}
        <div className="card p-4 lg:p-6 space-y-4">
          <h3 className="section-title">Lifestyle Factors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Smoking Status', k: 'smokingStatus', opts: ['Never', 'Former', 'Current'] },
              { label: 'Alcohol Use', k: 'alcoholUse', opts: ['None', 'Occasional', 'Regular'] },
              { label: 'Physical Activity', k: 'physicalActivity', opts: ['Sedentary', 'Low', 'Moderate', 'Active'] },
            ].map(({ label, k, opts }) => (
              <Field key={k} label={label}>
                <select className="input-field" value={form[k]} onChange={e => set(k, e.target.value.toLowerCase())}>
                  <option value="">Select...</option>
                  {opts.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                </select>
              </Field>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="card p-4 lg:p-6">
          <h3 className="section-title mb-4">Current Medications</h3>
          <CheckGroup field="medications" items={['Metformin', 'Insulin', 'Glipizide', 'Amlodipine', 'Lisinopril', 'Atenolol', 'Atorvastatin', 'Rosuvastatin', 'Aspirin']} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" /> : <Save size={15} />}
            Save Patient Record
          </button>
          <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </PageLayout>
  );
}
