import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  AlertTriangle,
  LogOut,
  X,
  History
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Books Catalog', path: '/books', icon: BookOpen },
    { name: 'Reader Management', path: '/readers', icon: Users },
    { name: 'Lending Operations', path: '/lending', icon: ClipboardList },
    { name: 'Overdue Alerts', path: '/overdue', icon: AlertTriangle },
    { name: 'Audit Logs', path: '/audit', icon: History },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 w-64 text-slate-700 dark:text-slate-300 transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-md">
            <img src="/assets/logo.jpeg" alt="Book-Club Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-md font-bold text-slate-900 dark:text-white leading-none">Book-Club</h1>
            <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Library Hub</span>
          </div>
        </div>
        {/* Close button for mobile */}
        <button 
          onClick={onClose} 
          className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 shadow-inner'
                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 bg-slate-200/40 dark:bg-[#090c14]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-950 dark:text-white truncate leading-none">{user?.name}</p>
            <p className="text-[9px] text-slate-500 truncate leading-none mt-1">@{user?.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 border border-slate-300 dark:border-slate-800 hover:border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit Staff Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex md:flex-col md:w-64 h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
