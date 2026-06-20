import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  ClipboardList, 
  Search, 
  User, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  BookMarked
} from 'lucide-react';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
}

interface Reader {
  _id: string;
  readerId: string;
  name: string;
  email: string;
}

interface LendingRecord {
  _id: string;
  book: {
    _id: string;
    title: string;
    isbn: string;
    author: string;
  };
  reader: {
    _id: string;
    name: string;
    readerId: string;
  };
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'LENT' | 'RETURNED' | 'OVERDUE';
}

export default function Lending() {
  const [lendings, setLendings] = useState<LendingRecord[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Selections
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [readerSearch, setReaderSearch] = useState('');
  
  // Dropdown States
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const [readerDropdownOpen, setReaderDropdownOpen] = useState(false);

  // Default due date (14 days from today)
  const getDefaultDueDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  // Min due date (tomorrow)
  const getMinDueDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(getDefaultDueDateString());

  // Calculate day difference for UI feedback
  const getDaysDifference = () => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dueDate);
    selected.setHours(0, 0, 0, 0);
    const diff = selected.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [lendingsRes, booksRes, readersRes] = await Promise.all([
        api.get('/lending'),
        api.get('/books'),
        api.get('/readers')
      ]);

      setLendings(Array.isArray(lendingsRes.data) ? lendingsRes.data : []);
      setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
      setReaders(Array.isArray(readersRes.data) ? readersRes.data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve checkout records or catalog listings.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const totalPages = Math.ceil(lendings.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLendings = lendings.slice(startIndex, startIndex + itemsPerPage);

  const handleLendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedReader) {
      setError('Please select both an available book and a registered reader.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await api.post('/lending', {
        bookId: selectedBook._id,
        readerId: selectedReader._id,
        dueDate
      });

      setSuccess(`Lent '${selectedBook.title}' successfully to '${selectedReader.name}'!`);
      
      // Reset Selections
      setSelectedBook(null);
      setSelectedReader(null);
      setBookSearch('');
      setReaderSearch('');
      setDueDate(getDefaultDueDateString());
      setCurrentPage(1);
      
      // Refresh Lists
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Lending transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmit = async (id: string, title: string) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await api.post(`/lending/${id}/return`);
      setSuccess(`Successfully processed return copy of '${title}'!`);
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  // Autocomplete Filters
  const filteredBooks = books.filter(b => 
    b.availableCopies > 0 && (
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.includes(bookSearch) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
    )
  );

  const filteredReaders = readers.filter(r => 
    r.name.toLowerCase().includes(readerSearch.toLowerCase()) ||
    r.readerId.toLowerCase().includes(readerSearch.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-[#020617] overflow-y-auto transition-colors duration-200 text-slate-800 dark:text-slate-100">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
          Lending & Returns Circulation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform book checkouts for readers and register copy returns.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Checkout Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleLendSubmit} className="glass-panel rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Checkout Desk</span>
            </h3>

            {/* Reader Auto-complete Select */}
            <div className="relative">
              <Input
                id="lending-reader-input"
                label="Patron / Reader"
                placeholder="Search by Reader ID or Name..."
                value={readerSearch}
                onChange={(e) => {
                  setReaderSearch(e.target.value);
                  setSelectedReader(null);
                  setReaderDropdownOpen(true);
                }}
                onFocus={() => setReaderDropdownOpen(true)}
                leftIcon={<User className="w-4 h-4" />}
                className={selectedReader ? 'border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10' : ''}
              />
              
              {readerDropdownOpen && readerSearch && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30">
                  {filteredReaders.length === 0 ? (
                    <div className="p-3 text-xs text-slate-450 dark:text-slate-500 text-center">No readers registered</div>
                  ) : (
                    filteredReaders.map((r) => (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => {
                          setSelectedReader(r);
                          setReaderSearch(`${r.name} (${r.readerId})`);
                          setReaderDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-850/50 last:border-0"
                      >
                        <p className="font-bold text-slate-850 dark:text-white">{r.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{r.readerId} • {r.email}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Book Auto-complete Select */}
            <div className="relative">
              <Input
                id="lending-book-input"
                label="Book Title"
                placeholder="Search by Book Title or ISBN..."
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  setSelectedBook(null);
                  setBookDropdownOpen(true);
                }}
                onFocus={() => setBookDropdownOpen(true)}
                leftIcon={<BookOpen className="w-4 h-4" />}
                className={selectedBook ? 'border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10' : ''}
              />

              {bookDropdownOpen && bookSearch && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30">
                  {filteredBooks.length === 0 ? (
                    <div className="p-3 text-xs text-slate-450 dark:text-slate-500 text-center">No available copies found</div>
                  ) : (
                    filteredBooks.map((b) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          setSelectedBook(b);
                          setBookSearch(b.title);
                          setBookDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-355 border-b border-slate-100 dark:border-slate-850/50 last:border-0"
                      >
                        <p className="font-bold text-slate-850 dark:text-white">{b.title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Author: {b.author} • ISBN: {b.isbn}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-455 rounded">
                          {b.availableCopies} Copies Available
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Custom Due Date Input */}
            <div className="relative">
              <Input
                id="lending-due-date-input"
                label="Return Due Date"
                type="date"
                value={dueDate}
                min={getMinDueDateString()}
                onChange={(e) => setDueDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>

            {/* Selected Due Date and Duration Info */}
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-450 font-medium">Issue Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">Today ({new Date().toLocaleDateString()})</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800/40 pt-2">
                <span className="text-slate-500 dark:text-slate-450 font-medium">Selected Due Date</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </span>
              </div>
              {getDaysDifference() > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-2 leading-relaxed text-center font-medium">
                  Patron will borrow the book for <span className="text-emerald-600 dark:text-emerald-450 font-bold">{getDaysDifference()} day(s)</span>.
                </p>
              )}
            </div>

            <Button
              id="btn-lending-checkout"
              type="submit"
              variant="primary"
              className="w-full py-3 text-xs uppercase tracking-widest font-bold shadow-md shadow-emerald-500/10"
              isLoading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Issue Book Checkout
            </Button>
          </form>
        </div>

        {/* Right Side: Circulations Table */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between overflow-hidden">
            <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Recent Circulations Feed</h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-transparent">
                  Circulation Logs
                </span>
              </div>

              {loading ? (
                <div className="p-16 flex flex-col justify-center items-center gap-4 text-slate-400 flex-1">
                  <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-semibold">Contacting Transaction Logs...</span>
                </div>
              ) : lendings.length === 0 ? (
                <div className="p-16 text-center space-y-4 flex flex-col items-center flex-1 justify-center">
                  <BookMarked className="w-12 h-12 text-slate-450 dark:text-slate-650" />
                  <p className="text-xs text-slate-550 dark:text-slate-450 max-w-xs">
                    No active book checkouts or returns logs exist in database archives.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-350">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                        <tr>
                          <th className="px-4 py-3">Book Title</th>
                          <th className="px-4 py-3">Patron Member</th>
                          <th className="px-4 py-3">Checkout Date</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 bg-white/30 dark:bg-transparent">
                        {paginatedLendings.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-200/20 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-950 dark:text-white max-w-[150px] truncate" title={log.book?.title}>
                              {log.book?.title || 'Unknown Title'}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-855 dark:text-slate-200">
                              <p>{log.reader?.name || 'Unknown Patron'}</p>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-550">{log.reader?.readerId}</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-500">
                              {new Date(log.issueDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-550 dark:text-slate-400">
                              {new Date(log.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {log.status === 'RETURNED' ? (
                                <span className="inline-block px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-455 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded uppercase tracking-wider">
                                  Returned
                                </span>
                              ) : log.status === 'OVERDUE' ? (
                                <span className="inline-block px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded uppercase tracking-wider">
                                  Overdue
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded uppercase tracking-wider">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {log.status !== 'RETURNED' ? (
                                <Button
                                  id={`btn-return-${log._id}`}
                                  variant="outline"
                                  size="sm"
                                  className="px-2.5 py-1 text-[10px] font-bold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                  onClick={() => handleReturnSubmit(log._id, log.book?.title)}
                                  isLoading={submitting}
                                >
                                  Return
                                </Button>
                              ) : (
                                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">
                                  Returned on {log.returnDate ? new Date(log.returnDate).toLocaleDateString() : '—'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 rounded-xl">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Showing <span className="font-bold text-slate-900 dark:text-white">{lendings.length > 0 ? startIndex + 1 : 0}</span> to{' '}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.min(startIndex + itemsPerPage, lendings.length)}
                      </span>{' '}
                      of <span className="font-bold text-slate-900 dark:text-white">{lendings.length}</span> logs
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        id="btn-lendings-prev"
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-[10px] font-bold"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={activePage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-[11px] text-slate-550 dark:text-slate-400 font-bold px-1.5">
                        Page {activePage} of {totalPages}
                      </span>
                      <Button
                        id="btn-lendings-next"
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-[10px] font-bold"
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
        </div>

      </div>

    </div>
  );
}
