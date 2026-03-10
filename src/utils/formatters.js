export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
export const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
export const formatPercent = (n) => n != null ? `${Math.round(n * 100)}%` : '—';
export const formatRiskScore = (n) => n != null ? (n * 100).toFixed(1) : '—';
export const riskBadgeClass = (cat) => ({ HIGH: 'badge-high', MODERATE: 'badge-moderate', LOW: 'badge-low' }[cat] || 'badge-low');
