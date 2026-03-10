import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { listGuidelines } from '../../services/reportService';
import { formatDate } from '../../utils/formatters';

const CAT_COLORS = { DIABETES: '#39d98a', HYPERTENSION: '#60a5fa', METABOLIC_SYNDROME: '#ffa502', GENERAL: '#a78bfa' };

export default function GuidelinesLibraryPage() {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listGuidelines().then(r => setGuidelines(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = guidelines.filter(g => g.title.toLowerCase().includes(search.toLowerCase()) || g.sourceOrg.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageLayout>
      <PageHeader title="Clinical Guidelines Library" subtitle="Evidence-based guidelines used by AI recommendations" />
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input className="input-field pl-9 max-w-md" placeholder="Search guidelines..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(g => {
            const color = CAT_COLORS[g.category] || '#8b93a7';
            return (
              <div key={g.id} onClick={() => navigate(`/guidelines/${g.id}`)}
                className="card p-5 cursor-pointer hover:border-accent-green/30 transition-all hover:shadow-glow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg mt-0.5" style={{ background: `${color}15` }}>
                    <BookOpen size={16} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary font-medium text-sm">{g.title}</p>
                    <p className="text-text-muted text-xs mt-1">{g.sourceOrg}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>{g.category.replace('_', ' ')}</span>
                      <span className="text-text-muted text-xs">{formatDate(g.publicationDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
