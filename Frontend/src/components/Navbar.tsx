import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Menu, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#090d16]/75 px-6 backdrop-blur-md text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Left items */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white md:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-150/40 dark:hover:bg-slate-900 transition-colors focus:outline-none"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 animate-fade-in" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 animate-fade-in" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{user?.name || 'Staff'}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase leading-none mt-1.5 block">
              Librarian
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/60 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-xs shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
}
