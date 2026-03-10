import { riskBadgeClass } from '../../utils/formatters';
export function RiskBadge({ category }) {
  if (!category) return null;
  return <span className={riskBadgeClass(category)}>{category === 'HIGH' ? 'High Risk' : category === 'MODERATE' ? 'Moderate' : 'Low Risk'}</span>;
}
export function RoleBadge({ role }) {
  const cls = { ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30', NURSE: 'bg-accent-green/15 text-accent-green border-accent-green/30', PHYSICIAN: 'bg-blue-500/15 text-blue-400 border-blue-500/30', DOCTOR: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' }[role] || 'bg-gray-500/15 text-gray-400';
  return <span className={`${cls} border text-xs font-semibold px-2 py-0.5 rounded-full`}>{role}</span>;
}
