import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getGuideline } from '../../services/reportService';
import { formatDate } from '../../utils/formatters';

export default function GuidelineViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guideline, setGuideline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuideline(id).then(r => setGuideline(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;
  if (!guideline) return <PageLayout><p className="text-text-muted">Guideline not found</p></PageLayout>;

  return (
    <PageLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/guidelines')} className="p-2 rounded-lg hover:bg-bg-card transition-colors"><ArrowLeft size={18} className="text-text-secondary" /></button>
        <div>
          <h1 className="page-title">{guideline.title}</h1>
          <p className="text-text-muted text-sm">{guideline.sourceOrg} • {formatDate(guideline.publicationDate)}</p>
        </div>
      </div>
      <div className="card p-6 max-w-3xl">
        <span className="text-xs text-accent-green font-semibold bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full mb-4 inline-block">{guideline.category.replace('_', ' ')}</span>
        <div className="prose text-text-secondary text-sm leading-relaxed mt-4 whitespace-pre-line">{guideline.contentText || 'No content available.'}</div>
      </div>
    </PageLayout>
  );
}
