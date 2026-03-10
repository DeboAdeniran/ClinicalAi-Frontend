import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, ClipboardList, Brain, Lightbulb, MessageSquare, BookOpen, ScrollText, BarChart3, Settings, LogOut, Activity, ShieldCheck, Stethoscope, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { group: 'CLINICAL', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/patients/new', icon: UserPlus, label: 'Register Patient', roles: ['NURSE', 'ADMIN'] },
  ]},
  { group: 'AI TOOLS', items: [
    { to: '/assessment', icon: ClipboardList, label: 'Assessment' },
    { to: '/predictions', icon: Brain, label: 'Risk Predictions' },
    { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  ]},
  { group: 'RECORDS', items: [
    { to: '/guidelines', icon: BookOpen, label: 'Guidelines' },
    { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  ]},
  { group: 'ADMIN', adminOnly: true, items: [
    { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/users', icon: ShieldCheck, label: 'User Management' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('#sidebar') && !e.target.closest('#menu-btn')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const canSee = (item) => !item.roles || item.roles.includes(user?.role);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-bg-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-green flex items-center justify-center animate-pulse-glow shrink-0">
            <Activity size={16} className="text-bg-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-text-primary text-sm leading-tight">ClinicalAI</p>
            <p className="text-text-muted text-xs">Decision Support</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 rounded hover:bg-bg-border transition-colors">
          <X size={18} className="text-text-secondary" />
        </button>
      </div>

      {/* User */}
      <div className="p-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center border border-accent-green/30 shrink-0">
            <Stethoscope size={14} className="text-accent-green" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">{user?.fullName || 'Loading...'}</p>
            <p className="text-text-muted text-xs truncate">{user?.role} • {user?.staffId}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navItems.map(group => {
          const visible = group.items.filter(canSee);
          if (group.adminOnly && user?.role !== 'ADMIN') return null;
          if (!visible.length) return null;
          return (
            <div key={group.group}>
              <p className="text-text-muted text-xs font-semibold px-3 mb-1 tracking-wider">{group.group}</p>
              {visible.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5 ${isActive ? 'bg-accent-green/15 text-accent-green font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'}`}>
                  <item.icon size={16} className="shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-bg-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-risk-high hover:bg-risk-high/10 transition-all duration-150 w-full">
          <LogOut size={16} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg-secondary border-b border-bg-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent-green flex items-center justify-center">
            <Activity size={14} className="text-bg-primary" />
          </div>
          <span className="font-display font-bold text-text-primary text-sm">ClinicalAI</span>
        </div>
        <button id="menu-btn" onClick={() => setOpen(v => !v)} className="p-2 rounded-lg hover:bg-bg-card transition-colors">
          <Menu size={20} className="text-text-secondary" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <aside id="sidebar"
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-bg-secondary border-r border-bg-border flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 bg-bg-secondary border-r border-bg-border flex-col z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
