import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patient Registry',
  '/patients/new': 'Register Patient',
  '/assessments': 'Clinical Assessments',
  '/predictions': 'Risk Predictions',
  '/recommendations': 'Recommendations',
  '/guidelines': 'Clinical Guidelines',
  '/audit': 'Audit Logs',
  '/reports': 'Reports',
  '/admin/users': 'User Management',
  '/admin/settings': 'System Settings',
  '/profile': 'My Profile'
};

export default function Topbar({ sidebarCollapsed, onMenuToggle }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const title = pageTitles[location.pathname] || 'ClinicalAI';

  return (
    <header className="h-16 bg-bg-secondary border-b border-bg-border flex items-center px-6 gap-4 sticky top-0 z-30">
      <button onClick={onMenuToggle} className="text-text-muted hover:text-text-primary transition-colors lg:hidden">
        <Menu size={20} />
      </button>

      <div>
        <h1 className="font-display font-bold text-text-primary text-base">{title}</h1>
        <p className="text-text-muted text-xs hidden sm:block">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2 bg-bg-elevated border border-bg-border rounded-xl px-3 py-2 w-64">
        <Search size={14} className="text-text-muted" />
        <input placeholder="Search patients..." className="bg-transparent text-text-primary text-sm placeholder-text-muted focus:outline-none flex-1" />
        <kbd className="text-text-muted text-xs bg-bg-border px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      <button className="relative p-2.5 rounded-xl bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary transition-colors">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-glow-pulse" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-bg-border">
        <div className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center">
          <span className="text-accent font-bold text-xs">{user?.full_name?.charAt(0)}</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-text-primary text-xs font-semibold">{user?.full_name}</p>
          <p className="text-text-muted text-xs capitalize">{user?.staff_id}</p>
        </div>
      </div>
    </header>
  );
}
