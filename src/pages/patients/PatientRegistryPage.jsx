import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import { RiskBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { listPatients } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';

export default function PatientRegistryPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      listPatients({ search }).then(r => setPatients(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <PageLayout>
      <PageHeader title="Patient Registry" subtitle={`${patients.length} patients`}
        actions={<button onClick={() => navigate('/patients/new')} className="btn-primary flex items-center gap-2 text-sm"><Plus size={15} /> <span className="hidden sm:inline">Register Patient</span></button>} />

      <div className="card p-4 lg:p-5">
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input-field pl-9" placeholder="Search by name or patient ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <LoadingSpinner /> : patients.length === 0 ? (
          <EmptyState title="No patients found" description="Register your first patient to get started"
            action={<button onClick={() => navigate('/patients/new')} className="btn-primary">Register Patient</button>} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border">
                    {['Patient ID', 'Name', 'Age', 'Gender', 'Conditions', 'Risk', 'Last Assessment', ''].map(h => (
                      <th key={h} className="text-left text-text-muted font-medium py-3 px-2 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => {
                    const latestRisk = p.riskPredictions?.[0];
                    const latestAssessment = p.assessments?.[0];
                    return (
                      <tr key={p.id} onClick={() => navigate(`/patients/${p.id}`)}
                        className="border-b border-bg-border/50 hover:bg-bg-secondary cursor-pointer transition-colors">
                        <td className="py-3 px-2 font-mono text-accent-green text-xs">{p.patientId}</td>
                        <td className="py-3 px-2 font-medium text-text-primary">{p.fullName}</td>
                        <td className="py-3 px-2 text-text-secondary">{p.age}</td>
                        <td className="py-3 px-2 text-text-secondary capitalize">{p.gender}</td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-1">
                            {(p.diagnoses || []).slice(0, 2).map(d => (
                              <span key={d} className="bg-bg-border text-text-muted text-xs px-2 py-0.5 rounded-full">{d}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2">{latestRisk ? <RiskBadge category={latestRisk.riskCategory} /> : <span className="text-text-muted text-xs">—</span>}</td>
                        <td className="py-3 px-2 text-text-secondary text-xs">{latestAssessment ? formatDate(latestAssessment.submittedAt) : '—'}</td>
                        <td className="py-3 px-2"><ChevronRight size={15} className="text-text-muted" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {patients.map(p => {
                const latestRisk = p.riskPredictions?.[0];
                return (
                  <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)}
                    className="bg-bg-secondary rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-bg-border transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-text-primary font-medium text-sm truncate">{p.fullName}</p>
                        {latestRisk && <RiskBadge category={latestRisk.riskCategory} />}
                      </div>
                      <p className="text-text-muted text-xs font-mono">{p.patientId} • {p.age}y • {p.gender}</p>
                      {(p.diagnoses || []).length > 0 && (
                        <p className="text-text-muted text-xs mt-1 truncate">{p.diagnoses.slice(0, 2).join(', ')}</p>
                      )}
                    </div>
                    <ChevronRight size={15} className="text-text-muted ml-3 shrink-0" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
