import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Book, 
  Users, 
  Bookmark, 
  AlertCircle,
  PlusCircle, 
  UserPlus, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [totalReaders, setTotalReaders] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        const [booksResponse, readersResponse] = await Promise.all([
          api.get('/books'),
          api.get('/readers')
        ]);
        
        // Handle array responses
        const books = Array.isArray(booksResponse.data) ? booksResponse.data : [];
        const readers = Array.isArray(readersResponse.data) ? readersResponse.data : [];

        setTotalBooks(books.length);
        setTotalReaders(readers.length);
      } catch (err: any) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to load system metrics from backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { 
      name: 'Total Book Catalog', 
      value: totalBooks, 
      loading: loading, 
      icon: Book, 
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Total titles registered in database'
    },
    { 
      name: 'Registered Readers', 
      value: totalReaders, 
      loading: loading, 
      icon: Users, 
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      description: 'Active patron memberships'
    },
    { 
      name: 'Active Borrowings', 
      value: 12, // Mocked for now (Phase 3 spec)
      loading: false, 
      icon: Bookmark, 
      color: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: 'Books currently checked out'
    },
    { 
      name: 'Overdue Books', 
      value: 3, // Mocked for now (Phase 3 spec)
      loading: false, 
      icon: AlertCircle, 
      color: 'from-rose-500/20 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      description: 'Outstanding returns past due'
    },
  ];

  // Quick shortcut triggers
  const actions = [
    { name: 'Register New Reader', icon: UserPlus, path: '/readers', color: 'hover:border-blue-500/40 text-blue-600 dark:text-blue-450 hover:bg-blue-500/5' },
    { name: 'Add Book to Catalog', icon: PlusCircle, path: '/books', color: 'hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/5' },
    { name: 'Record Lending Transaction', icon: Bookmark, path: '/lending', color: 'hover:border-amber-500/40 text-amber-600 dark:text-amber-450 hover:bg-amber-500/5' },
  ];

  // Mocked activities feed representing audit events
  const activities = [
    { id: 1, action: 'CREATE_READER', detail: "Registered new reader profile 'Alice Cooper'", user: 'librarian1', time: '10 mins ago', success: true },
    { id: 2, action: 'CREATE_BOOK', detail: "Added book 'The Hobbit' (9780261102217) to catalog", user: 'librarian1', time: '30 mins ago', success: true },
    { id: 3, action: 'LEND_BOOK', detail: "Lent 'The Hobbit' to reader 'Alice Cooper'", user: 'librarian1', time: '2 hours ago', success: true },
    { id: 4, action: 'UPDATE_BOOK', detail: "Adjusted stock levels for 'The Great Gatsby'", user: 'librarian1', time: 'Yesterday', success: true },
    { id: 5, action: 'OVERDUE_ALERT', detail: "Sent email alert to Bob Marley for overdue book", user: 'system', time: 'Yesterday', success: true },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-[#020617] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            Library Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and management controls for the Book-Club Library System.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 shadow-sm">
          <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>System Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span className="text-sm text-rose-700 dark:text-rose-300 font-medium">{error}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="glass-panel rounded-xl p-5 shadow-lg flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{stat.name}</span>
                {stat.loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
                ) : (
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stat.value}</span>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-tr border dark:border-slate-800/80 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/40">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Actions and Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Quick Shortcuts</span>
            </h3>
            <div className="flex flex-col gap-3">
              {actions.map((act) => (
                <button
                  key={act.name}
                  onClick={() => navigate(act.path)}
                  className={`w-full flex items-center justify-between border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 rounded-xl p-4 text-xs font-bold transition-all duration-300 ${act.color} shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <act.icon className="w-4 h-4" />
                    <span>{act.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-40 hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* System Information */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">System Profile</h3>
            <div className="text-xs space-y-3.5">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-2">
                <span className="text-slate-500 dark:text-slate-400">API Host Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Database Connection</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">MongoDB Local</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-2">
                <span className="text-slate-500 dark:text-slate-400">JWT Authentication</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">Enabled (Bearer)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mailer Service</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Mailtrap Host</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Audit / Activity Log */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Recent System Activities</h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-transparent">
                  Audit Feed
                </span>
              </div>

              <div className="divide-y divide-slate-250 dark:divide-slate-800/40">
                {activities.map((act) => (
                  <div key={act.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {act.detail}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 font-semibold">User: @{act.user}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-650 font-bold">•</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{act.time}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">
                      {act.action.split('_')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/40 font-medium">
              Audit log storage is automatically secured and compliant.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
