import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, Send } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recId = searchParams.get('rec') || id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: '', comments: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await api.post('/feedback', { recommendation_id: recId || 'demo', ...form });
      toast.success('Feedback submitted — thank you!');
      navigate('/dashboard');
    } catch {} finally { setLoading(false); }
  };

  const ratings = [
    { value: 'useful', icon: ThumbsUp, label: 'Useful', desc: 'Clinically relevant and actionable', color: '#00C896' },
    { value: 'partially_useful', icon: Minus, label: 'Partially Useful', desc: 'Some suggestions needed adjustment', color: '#FFB800' },
    { value: 'not_useful', icon: ThumbsDown, label: 'Not Useful', desc: 'Not applicable to this patient', color: '#FF4757' }
  ];

  return (
    <div className="max-w-xl mx-auto animate-slide-up space-y-6">
      <PageHeader title="Submit Feedback" subtitle="Help us improve AI recommendation quality"
        actions={<button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-text-primary font-semibold text-sm mb-5">How useful was this recommendation? *</h3>
          <div className="space-y-3">
            {ratings.map(({ value, icon: Icon, label, desc, color }) => (
              <label key={value} className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                style={form.rating === value ? { borderColor: color+'60', backgroundColor: color+'10' } : { borderColor:'#1E1E2E', backgroundColor:'#1C1C28' }}>
                <input type="radio" name="rating" value={value} className="hidden" onChange={e => setForm(f => ({...f, rating: e.target.value}))} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color+'20' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div><p className="text-text-primary font-semibold text-sm">{label}</p><p className="text-text-muted text-xs mt-0.5">{desc}</p></div>
              </label>
            ))}
          </div>
        </div>
        <div className="card">
          <label className="label">Additional Comments</label>
          <textarea className="input min-h-28 resize-none" placeholder="Clinical concerns, specific issues, suggestions..." value={form.comments} onChange={e => setForm(f => ({...f, comments: e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Skip</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> Submit</>}
          </button>
        </div>
      </form>
    </div>
  );
}
