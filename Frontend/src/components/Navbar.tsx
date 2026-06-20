import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Determine current page title based on path
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'System Overview';
      case '/books':
        return 'Books Catalogue';
      case '/readers':
        return 'Reader Registry';
      case '/lending':
        return 'Lending & Returns';
      case '/overdue':
        return 'Overdue Delinquencies';
      default:
        return 'Library Hub';
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-800/60 bg-[#090d16]/75 px-6 backdrop-blur-md">
      {/* Left items */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden focus:outline-none focus:ring-1 focus:ring-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h2 className="text-lg font-bold tracking-tight text-white font-sans">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-200 leading-none">{user?.name || 'Staff'}</p>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase leading-none mt-1.5 block">
              Librarian
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-slate-200 text-xs shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
}
