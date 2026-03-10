import React from 'react';
export default function RiskBadge({ risk }) {
  if (!risk) return <span className="badge-accent">Unknown</span>;
  const cls = { high: 'badge-high', moderate: 'badge-moderate', low: 'badge-low' };
  const labels = { high: 'High Risk', moderate: 'Moderate', low: 'Low Risk' };
  return <span className={cls[risk] || 'badge-accent'}>{labels[risk] || risk}</span>;
}
