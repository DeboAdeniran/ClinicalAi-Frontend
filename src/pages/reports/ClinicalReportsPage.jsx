import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRiskDistribution, getHighRiskPatients } from '../../services/reportService';
import { formatDate } from '../../utils/formatters';

export default function ClinicalReportsPage() {
  const [distribution, setDistribution] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRiskDistribution(), getHighRiskPatients()])
      .then(([d, h]) => { setDistribution(d.data || []); setHighRisk(h.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const COLORS = { HIGH: '#ff4757', MODERATE: '#ffa502', LOW: '#39d98a' };
  const pieData = distribution.map(d => ({ name: d.riskCategory, value: d._count, color: COLORS[d.riskCategory] }));

  if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;

  return (
    <PageLayout>
      <PageHeader title="Clinical Reports" subtitle="Patient risk analytics and assessment data" />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h3 className="section-title mb-4">Risk Category Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pieData}>
              <XAxis dataKey="name" stroke="#555d72" tick={{ fontSize: 12 }} />
              <YAxis stroke="#555d72" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 8, color: '#f0f2f7' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Risk Breakdown</h3>
          <div className="flex justify-center mt-4">
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx={80} cy={80} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 8, color: '#f0f2f7' }} />
            </PieChart>
          </div>
          {pieData.map(d => (
            <div key={d.name} className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-text-secondary">{d.name}</span></div>
              <span className="text-text-primary font-medium">{d.value} patients</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="section-title mb-4">High Risk Patients</h3>
        {!highRisk.length ? <p className="text-text-muted text-sm text-center py-8">No high risk patients found</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bg-border">{['Patient ID', 'Name', 'Age', 'Latest CV Risk', 'Last Assessment'].map(h => <th key={h} className="text-left text-text-muted font-medium py-2 px-2 text-xs">{h}</th>)}</tr></thead>
            <tbody>{highRisk.map(p => (
              <tr key={p.id} className="border-b border-bg-border/50">
                <td className="py-2 px-2 font-mono text-accent-green text-xs">{p.patientId}</td>
                <td className="py-2 px-2 text-text-primary">{p.fullName}</td>
                <td className="py-2 px-2 text-text-secondary">{p.age}</td>
                <td className="py-2 px-2 text-risk-high font-medium">{p.riskPredictions?.[0] ? `${(p.riskPredictions[0].cvRiskScore * 100).toFixed(1)}%` : '—'}</td>
                <td className="py-2 px-2 text-text-muted text-xs">{p.assessments?.[0] ? formatDate(p.assessments[0].submittedAt) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </PageLayout>
  );
}
