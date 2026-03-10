import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Edit, UserCheck, Save } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function NurseActionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recId = searchParams.get('rec') || id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    decision_type: '', modified_recommendation: '', notes: '',
    follow_up_plan: { schedule_monitoring: '', schedule_referral: '', next_assessment: '' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.decision_type) return toast.error('Please select a decision type');
    setLoading(true);
    try {
      await api.post('/decisions', { recommendation_id: recId || 'demo', ...form });
      toast.success('Decision recorded successfully');
      navigate('/patients');
    } catch {} finally { setLoading(false); }
  };

  const decisions = [
    { value: 'accepted', icon: CheckCircle, label: 'Accept Recommendation', desc: 'Proceed with AI recommendations as provided', color: '#00C896' },
    { value: 'modified', icon: Edit, label: 'Modify Recommendation', desc: 'Accept with modifications to better suit the patient', color: '#FFB800' },
    { value: 'escalated', icon: UserCheck, label: 'Escalate to Physician', desc: 'Forward case to attending physician for review', color: '#00A8FF' }
  ];

  return (
    <div className="max-w-2xl mx-auto animate-slide-up space-y-6">
      <PageHeader
        title="Record Clinical Decision"
        subtitle="Document your response to the AI recommendation"
        actions={<button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-text-primary font-semibold text-sm mb-5 pb-3 border-b border-bg-border">Decision Type *</h3>
          <div className="space-y-3">
            {decisions.map(({ value, icon: Icon, label, desc, color }) => (
              <label key={value} className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                style={form.decision_type === value ? { borderColor: color+'60', backgroundColor: color+'10' } : { borderColor:'#1E1E2E', backgroundColor:'#1C1C28' }}>
                <input type="radio" name="decision_type" value={value} className="hidden" onChange={e => setForm(f => ({...f, decision_type: e.target.value}))} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color+'20' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div><p className="text-text-primary font-semibold text-sm">{label}</p><p className="text-text-muted text-xs mt-0.5">{desc}</p></div>
              </label>
            ))}
          </div>
        </div>
        {form.decision_type === 'modified' && (
          <div className="card">
            <label className="label">Modified Recommendation</label>
            <textarea className="input min-h-32 resize-none" placeholder="Describe the modifications..." value={form.modified_recommendation} onChange={e => setForm(f => ({...f, modified_recommendation: e.target.value}))} />
          </div>
        )}
        <div className="card">
          <h3 className="text-text-primary font-semibold text-sm mb-5 pb-3 border-b border-bg-border">Notes & Follow-Up</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Clinical Notes</label>
              <textarea className="input min-h-24 resize-none" placeholder="Observations, reasoning..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[['schedule_monitoring','Schedule Monitoring'],['schedule_referral','Schedule Referral'],['next_assessment','Next Assessment']].map(([key, label]) => (
                <div key={key}><label className="label">{label}</label>
                <input className="input" type="date" value={form.follow_up_plan[key]} onChange={e => setForm(f => ({...f, follow_up_plan: {...f.follow_up_plan, [key]: e.target.value}}))} /></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" /> : <><Save size={14} /> Save Decision</>}
          </button>
        </div>
      </form>
    </div>
  );
}
