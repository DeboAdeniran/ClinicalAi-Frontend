import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, AlertTriangle, Clock, Plus, Search, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardStats } from '../../services/reportService';
import { formatDateTime } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const MOCK_WEEKLY = [
  { day: 'Mon', assessments: 4 }, { day: 'Tue', assessments: 7 }, { day: 'Wed', assessments: 5 },
  { day: 'Thu', assessments: 9 }, { day: 'Fri', assessments: 6 }, { day: 'Sat', assessments: 3 }, { day: 'Sun', assessments: 2 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pieData = [
    { name: 'High Risk', value: 28, color: '#ff4757' },
    { name: 'Moderate', value: 45, color: '#ffa502' },
    { name: 'Low Risk', value: 27, color: '#39d98a' },
  ];

  if (loading) return <PageLayout><LoadingSpinner size="lg" /></PageLayout>;

  return (
    <PageLayout>
      <PageHeader
        title={`Good morning, ${user?.fullName?.split(' ')[0] || 'Doctor'} 👋`}
        subtitle="Here's your clinical overview for today"
        actions={
          <button onClick={() => navigate('/patients/new')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> <span className="hidden sm:inline">New Patient</span>
          </button>
        }
      />

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} sub="Under monitoring" icon={Users} color="blue" />
        <StatCard title="Assessed Today" value={stats?.assessmentsToday ?? 0} sub="Clinical assessments" icon={ClipboardList} color="accent-green" />
        <StatCard title="High Risk" value={stats?.highRisk ?? 0} sub="Requires attention" icon={AlertTriangle} color="risk-high" />
        <StatCard title="Pending Reviews" value={stats?.pendingDecisions ?? 0} sub="Awaiting action" icon={Clock} color="risk-moderate" />
      </div>

      {/* Charts row — stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Weekly Assessments</h3>
            <span className="text-text-muted text-xs">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MOCK_WEEKLY} barSize={22}>
              <XAxis dataKey="day" stroke="#555d72" tick={{ fontSize: 11 }} />
              <YAxis stroke="#555d72" tick={{ fontSize: 11 }} width={24} />
              <Tooltip contentStyle={{ background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 8, color: '#f0f2f7', fontSize: 12 }} cursor={{ fill: 'rgba(57,217,138,0.05)' }} />
              <Bar dataKey="assessments" fill="#39d98a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3">Risk Distribution</h3>
          <div className="flex items-center justify-center">
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={70} cy={70} innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 8, color: '#f0f2f7', fontSize: 12 }} />
            </PieChart>
          </div>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-text-secondary text-xs">{d.name}</span>
                </div>
                <span className="text-text-primary font-medium text-xs">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row — stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Assessments</h3>
            <button onClick={() => navigate('/patients')} className="text-accent-green text-xs flex items-center gap-1 hover:underline">
              View all <ChevronRight size={13} />
            </button>
          </div>
          {stats?.recentAssessments?.length ? (
            <div className="space-y-2">
              {stats.recentAssessments.map(a => (
                <div key={a.id} onClick={() => navigate(`/patients/${a.patientId}`)}
                  className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-bg-border cursor-pointer transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-text-primary text-sm font-medium truncate">{a.patient?.fullName || 'Unknown'}</p>
                    <p className="text-text-muted text-xs truncate">{a.patient?.patientId} • {formatDateTime(a.submittedAt)}</p>
                  </div>
                  {a.prediction ? <RiskBadge category={a.prediction.riskCategory} /> : <span className="text-text-muted text-xs whitespace-nowrap">Pending AI</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">No assessments yet today</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Register New Patient', icon: Plus, to: '/patients/new', color: '#39d98a' },
              { label: 'Start Assessment', icon: ClipboardList, to: '/assessment', color: '#60a5fa' },
              { label: 'Search Patients', icon: Search, to: '/patients', color: '#a78bfa' },
            ].map(({ label, icon: Icon, to, color }) => (
              <button key={to} onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 p-3 bg-bg-secondary rounded-lg hover:bg-bg-border transition-colors text-left">
                <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <span className="text-text-primary text-sm">{label}</span>
                <ChevronRight size={13} className="text-text-muted ml-auto shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
