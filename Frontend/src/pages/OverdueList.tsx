import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { 
  AlertTriangle, 
  Mail, 
  Check, 
  Clock, 
  User, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface OverdueRecord {
  _id: string;
  book: {
    title: string;
    isbn: string;
    author: string;
  };
  reader: {
    name: string;
    email: string;
    phone: string;
    readerId: string;
  };
  issueDate: string;
  dueDate: string;
  status: 'LENT' | 'RETURNED' | 'OVERDUE';
}

export default function OverdueList() {
  const [records, setRecords] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOverdueRecords();
  }, []);

  const fetchOverdueRecords = async () => {
    try {
      setLoading(true);
      setError('');
      // This automatically updates statuses dynamically in our controller
      const response = await api.get('/lending?status=OVERDUE');
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve overdue records list from library database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async (id: string, readerName: string, bookTitle: string) => {
    try {
      setSendingId(id);
      setError('');
      setSuccess('');

      await api.post(`/lending/${id}/alert`);
      
      setSuccess(`Nodemailer overdue notice successfully dispatched to '${readerName}'!`);
      setSentIds(prev => ({ ...prev, [id]: true }));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || `Failed to dispatch email notice to ${readerName}.`);
    } finally {
      setSendingId(null);
    }
  };

  // Helper to calculate days overdue
  const getOverdueDays = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(records.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-[#020617] overflow-y-auto transition-colors duration-200 text-slate-800 dark:text-slate-100">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <span>Overdue Patrons Registry</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Identify outstanding book checkouts and dispatch automated email reminders.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-3 items-center animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3 items-center animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">{error}</span>
        </div>
      )}

      {/* Overdue Board Grid */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col justify-center items-center gap-4 text-slate-400">
            <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-semibold">Scanning Circulation Records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center space-y-4 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-455">
              <Check className="w-7 h-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">No Overdue Titles</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Excellent! All borrowed library volumes are currently within their due date limit parameters.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-355">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-4">Patron Details</th>
                    <th className="px-6 py-4">Overdue Book Title</th>
                    <th className="px-6 py-4">Checkout Date</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-center">Overdue Duration</th>
                    <th className="px-6 py-4 text-right">Circulation Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 bg-white/30 dark:bg-transparent">
                  {paginatedRecords.map((rec) => {
                    const days = getOverdueDays(rec.dueDate);
                    const isSent = !!sentIds[rec._id];
                    const isSending = sendingId === rec._id;

                    return (
                      <tr key={rec._id} className="hover:bg-slate-200/20 dark:hover:bg-slate-900/30 transition-colors">
                        {/* Patron Info */}
                        <td className="px-6 py-4 font-semibold text-slate-955 dark:text-white">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-450 shrink-0" />
                            <div>
                              <p>{rec.reader?.name || 'Unknown'}</p>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {rec.reader?.readerId || '—'}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Book Info */}
                        <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-250">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-455 shrink-0" />
                            <div>
                              <p className="max-w-[200px] truncate" title={rec.book?.title}>{rec.book?.title || 'Unknown'}</p>
                              <span className="text-[10px] font-mono text-slate-400">ISBN: {rec.book?.isbn || '—'}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Issue Date */}
                        <td className="px-6 py-4 font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(rec.issueDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        
                        {/* Due Date */}
                        <td className="px-6 py-4 font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-rose-500/50" />
                            <span>{new Date(rec.dueDate).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Days Overdue */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-full uppercase tracking-wider">
                            {days} day(s) overdue
                          </span>
                        </td>

                        {/* Action alert dispatch */}
                        <td className="px-6 py-4 text-right">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-800/30 px-2.5 py-1 rounded">
                              <Check className="w-3.5 h-3.5" />
                              <span>Alert Sent</span>
                            </span>
                          ) : (
                            <Button
                              id={`btn-alert-${rec._id}`}
                              variant="primary"
                              size="sm"
                              className="bg-rose-600 hover:bg-rose-505 text-white shadow-none text-[10px]"
                              leftIcon={<Mail className="w-3.5 h-3.5" />}
                              onClick={() => handleSendAlert(rec._id, rec.reader?.name, rec.book?.title)}
                              isLoading={isSending}
                            >
                              Send Alert
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 dark:text-slate-455 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{records.length > 0 ? startIndex + 1 : 0}</span> to{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(startIndex + itemsPerPage, records.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900 dark:text-white">{records.length}</span> records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  id="btn-overdue-prev"
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
                  id="btn-overdue-next"
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
