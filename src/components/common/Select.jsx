export default function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
      <select className={`w-full bg-card border ${error ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition-colors ${className}`} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
