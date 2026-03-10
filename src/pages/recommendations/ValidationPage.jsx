import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { recommendationService } from '../../services/recommendationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';

export default function ValidationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === 'undefined') { setLoading(false); return; }
    recommendationService.getValidation(id).then(r => setValidation(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  if (!validation) return (
    <div className="text-center py-24">
      <Shield size={48} className="text-text-muted mx-auto mb-4" />
      <p className="text-text-muted">No validation data found</p>
      <button onClick={() => navigate(-1)} className="btn-ghost mt-4 mx-auto">Go Back</button>
    </div>
  );

  const safetyChecks = typeof validation.safety_checks === 'string' ? JSON.parse(validation.safety_checks) : validation.safety_checks || {};
  const corrections = typeof validation.suggested_corrections === 'string' ? JSON.parse(validation.suggested_corrections) : validation.suggested_corrections || [];
  const statusConfig = {
    'full': { color: '#00C896', icon: CheckCircle, label: 'Fully Compliant' },
    'partial': { color: '#FFB800', icon: AlertTriangle, label: 'Partial Compliance' },
    'risk_detected': { color: '#FF4757', icon: XCircle, label: 'Risk Detected' }
  }[validation.compliance_status] || { color: '#8B8BA7', icon: Info, label: validation.compliance_status };

  const { icon: StatusIcon, color, label } = statusConfig;

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-6">
      <PageHeader
        title="Safety Validation"
        subtitle="Guideline compliance and safety check results"
        actions={<button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>}
      />

      {/* Overall status */}
      <div className="card" style={{ borderColor: color + '40', boxShadow: `0 0 24px ${color}10` }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <StatusIcon size={24} style={{ color }} />
          </div>
          <div>
            <p className="text-text-muted text-xs mb-1">Compliance Status</p>
            <p className="font-display font-bold text-xl text-text-primary">{label}</p>
          </div>
          <div className="ml-auto">
            <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${validation.overall_safe ? 'bg-accent-muted text-accent' : 'bg-risk-high-muted text-risk-high'}`}>
              {validation.overall_safe ? '✓ Safe to Proceed' : '⚠ Review Required'}
            </div>
          </div>
        </div>
      </div>

      {/* Safety checks */}
      <div className="card">
        <h3 className="text-text-primary font-semibold text-sm mb-5">Safety Check Results</h3>
        <div className="space-y-4">
          {[
            { key: 'drug_interactions', label: 'Drug Interactions', emptyText: 'No drug interactions detected' },
            { key: 'contraindications', label: 'Contraindications', emptyText: 'No contraindications detected' },
            { key: 'age_related_risks', label: 'Age-Related Risks', emptyText: 'No age-related risks noted' }
          ].map(({ key, label, emptyText }) => (
            <div key={key} className="bg-bg-elevated rounded-xl p-4">
              <p className="text-text-primary text-sm font-semibold mb-3">{label}</p>
              {(safetyChecks[key] || []).length === 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-accent" />
                  <span className="text-text-muted text-sm">{emptyText}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {safetyChecks[key].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-risk-moderate flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {corrections.length > 0 && (
        <div className="card border-risk-moderate/30">
          <h3 className="text-risk-moderate font-semibold text-sm mb-4 flex items-center gap-2">
            <Info size={14} /> Suggested Corrections
          </h3>
          <div className="space-y-2">
            {corrections.map((c, i) => (
              <div key={i} className="flex items-start gap-3 bg-risk-moderate-muted rounded-xl p-3">
                <span className="text-risk-moderate font-bold text-xs">{i+1}</span>
                <span className="text-text-secondary text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
