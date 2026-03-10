export default function Button({ children, variant = 'primary', size = 'md', loading, onClick, type = 'button', className = '', disabled }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25',
    secondary: 'bg-card hover:bg-card-hover border border-border text-slate-300 hover:text-white',
    danger: 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400',
    ghost: 'hover:bg-card text-slate-400 hover:text-white',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
      {children}
    </button>
  );
}
