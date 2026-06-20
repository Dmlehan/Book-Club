import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  History, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Database,
  Cpu,
  FileText
} from 'lucide-react';

interface AuditRecord {
  _id: string;
  action: string;
  collectionName: string;
  documentId: string;
  performedBy: {
    _id: string;
    username: string;
    name: string;
  } | null;
  details?: string;
  timestamp: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/audit');
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve system operations audit logs.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format action badges with premium Tailwinds HSL styles
  const getActionBadgeClass = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('LEND')) {
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/30';
    }
    if (act.includes('DELETE') || act.includes('REVOKE') || act.includes('REMOVE')) {
      return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-900/30';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('RETURN')) {
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30';
    }
    if (act.includes('ALERT') || act.includes('SEND') || act.includes('WARN')) {
      return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border-teal-250 dark:border-teal-900/30';
    }
    return 'text-slate-600 dark:text-slate-400 bg-slate-105 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40';
  };

  // Format action text for cleaner reading (e.g. LEND_BOOK -> Lend Book)
  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filter logs list client side based on query
  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    const actionMatch = log.action.toLowerCase().includes(term);
    const detailsMatch = log.details?.toLowerCase().includes(term) || false;
    const collectionMatch = log.collectionName.toLowerCase().includes(term);
    const userMatch = log.performedBy?.name.toLowerCase().includes(term) || 
                      log.performedBy?.username.toLowerCase().includes(term) || 
                      false;
    
    return actionMatch || detailsMatch || collectionMatch || userMatch;
  });

  // Pagination Slice Calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-[#020617] overflow-y-auto transition-colors duration-200 text-slate-800 dark:text-slate-100">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-500" />
          <span>System Audit Trail</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review past library operations, database adjustments, book checkouts, and system events.
        </p>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3 items-center animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-md w-full">
        <Input
          id="input-audit-search"
          type="text"
          placeholder="Filter logs by action, details, collections, staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col justify-center items-center gap-4 text-slate-400">
            <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-semibold">Contacting Audit Logs Database...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center space-y-4 flex flex-col items-center justify-center">
            <Database className="w-12 h-12 text-slate-450 dark:text-slate-650" />
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">No Logs Recorded</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {search ? 'No audit records match your search criteria.' : 'System database does not contain log histories.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-355">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-4">Librarian Staff</th>
                    <th className="px-6 py-4">Event Action</th>
                    <th className="px-6 py-4">Collection</th>
                    <th className="px-6 py-4">Document ID</th>
                    <th className="px-6 py-4">Log Details Description</th>
                    <th className="px-6 py-4">Event Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 bg-white/30 dark:bg-transparent">
                  {paginatedLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-200/20 dark:hover:bg-slate-900/30 transition-colors">
                      {/* Librarian User */}
                      <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p>{log.performedBy?.name || 'System Auto'}</p>
                            <span className="text-[10px] text-slate-400 font-mono">@{log.performedBy?.username || 'system'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Action Event Tag */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                          {formatActionName(log.action)}
                        </span>
                      </td>

                      {/* Collection */}
                      <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.collectionName}</span>
                        </div>
                      </td>

                      {/* Document ID */}
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={log.documentId}>
                        {log.documentId}
                      </td>

                      {/* Log details */}
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 max-w-sm whitespace-normal leading-relaxed">
                        <div className="flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{log.details || 'No additional context provided.'}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-4 font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-550 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{filteredLogs.length > 0 ? startIndex + 1 : 0}</span> to{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900 dark:text-white">{filteredLogs.length}</span> logs
              </span>
              <div className="flex items-center gap-2">
                <Button
                  id="btn-audit-prev"
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5 text-[11px] font-bold"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={activePage === 1}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-550 dark:text-slate-400 font-bold px-2">
                  Page {activePage} of {totalPages}
                </span>
                <Button
                  id="btn-audit-next"
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5 text-[11px] font-bold"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={activePage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
