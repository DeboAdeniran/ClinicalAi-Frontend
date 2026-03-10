import { clsx } from 'clsx';
import { Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return <Loader2 className={clsx('animate-spin text-accent-primary', s, className)} />;
};

export const LoadingPage = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <div className="text-center space-y-3">
      <Spinner size="lg" />
      <p className="text-text-secondary text-sm font-body">Loading...</p>
    </div>
  </div>
);

export const RiskBadge = ({ category }) => {
  const map = {
    HIGH: <span className="risk-badge-high">High Risk</span>,
    MODERATE: <span className="risk-badge-moderate">Moderate Risk</span>,
    LOW: <span className="risk-badge-low">Low Risk</span>,
  };
  return map[category] || <span className="risk-badge-low">Unknown</span>;
};

export const Alert = ({ type = 'info', message, className = '' }) => {
  const styles = {
    error: { bg: 'bg-risk-highDim border-risk-high/30', icon: <AlertCircle className="w-4 h-4 text-risk-high flex-shrink-0" />, text: 'text-risk-high' },
    success: { bg: 'bg-risk-lowDim border-risk-low/30', icon: <CheckCircle2 className="w-4 h-4 text-risk-low flex-shrink-0" />, text: 'text-risk-low' },
    info: { bg: 'bg-accent-dim border-accent-primary/20', icon: <Info className="w-4 h-4 text-accent-primary flex-shrink-0" />, text: 'text-text-primary' },
  }[type];

  return (
    <div className={clsx('flex items-start gap-3 p-3 rounded-xl border text-sm', styles.bg, className)}>
      {styles.icon}
      <span className={clsx('font-body', styles.text)}>{message}</span>
    </div>
  );
};

export const StatCard = ({ label, value, sub, icon: Icon, color = 'accent' }) => {
  const colors = {
    accent: { icon: 'text-accent-primary', bg: 'bg-accent-dim', border: 'border-accent-primary/20' },
    high: { icon: 'text-risk-high', bg: 'bg-risk-highDim', border: 'border-risk-high/20' },
    moderate: { icon: 'text-risk-moderate', bg: 'bg-risk-moderateDim', border: 'border-risk-moderate/20' },
    low: { icon: 'text-risk-low', bg: 'bg-risk-lowDim', border: 'border-risk-low/20' },
  }[color];

  return (
    <div className={clsx('card p-5 flex items-start gap-4 animate-fade-in border', colors.border)}>
      {Icon && (
        <div className={clsx('p-3 rounded-xl flex-shrink-0', colors.bg)}>
          <Icon className={clsx('w-5 h-5', colors.icon)} />
        </div>
      )}
      <div>
        <p className="text-text-secondary text-xs font-display uppercase tracking-wider">{label}</p>
        <p className="font-display font-bold text-2xl text-text-primary mt-0.5">{value}</p>
        {sub && <p className="text-text-secondary text-xs mt-0.5 font-body">{sub}</p>}
      </div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="text-text-secondary text-sm font-body mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <div className="p-4 bg-bg-elevated rounded-2xl mb-4"><Icon className="w-8 h-8 text-text-muted" /></div>}
    <h3 className="font-display font-semibold text-text-primary mb-1">{title}</h3>
    <p className="text-text-secondary text-sm font-body max-w-xs">{description}</p>
  </div>
);

export const MockBanner = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-risk-moderateDim border border-risk-moderate/30 rounded-lg text-xs text-risk-moderate font-display">
    <Info className="w-3.5 h-3.5" />
    AI service offline — showing mock data
  </div>
);
