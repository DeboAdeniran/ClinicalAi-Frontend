export default function StatCard({ title, value, sub, icon: Icon, color = 'accent-green', trend }) {
  const colorMap = { 'accent-green': '#39d98a', 'risk-high': '#ff4757', 'risk-moderate': '#ffa502', blue: '#60a5fa', purple: '#a78bfa' };
  const c = colorMap[color] || colorMap['accent-green'];
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <p className="text-text-secondary text-sm">{title}</p>
        {Icon && <div className="p-2 rounded-lg" style={{ background: `${c}18` }}><Icon size={16} style={{ color: c }} /></div>}
      </div>
      <p className="text-3xl font-display font-bold text-text-primary mt-1">{value}</p>
      {sub && <p className="text-text-secondary text-xs">{sub}</p>}
      {trend && <p className={`text-xs font-medium ${trend > 0 ? 'text-accent-green' : 'text-risk-high'}`}>{trend > 0 ? '+' : ''}{trend}% this week</p>}
    </div>
  );
}
