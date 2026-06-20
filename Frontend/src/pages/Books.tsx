import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import Modal from '../components/Modal';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Bookmark, 
  Hash, 
  Layers, 
  Sliders,
  FolderOpen
} from 'lucide-react';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre?: string;
  totalCopies: number;
  availableCopies: number;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Control
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [availableCopies, setAvailableCopies] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Query books when component mounts or when search input changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300); // 300ms debounce to prevent spamming queries

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = search.trim() 
        ? `/books?search=${encodeURIComponent(search.trim())}` 
        : '/books';
      
      const response = await api.get(endpoint);
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load books catalog list from database server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedBook(null);
    setTitle('');
    setAuthor('');
    setIsbn('');
    setGenre('');
    setTotalCopies(1);
    setAvailableCopies(1);
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setSelectedBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setGenre(book.genre || '');
    setTotalCopies(book.totalCopies);
    setAvailableCopies(book.availableCopies);
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenDelete = (book: Book) => {
    setSelectedBook(book);
    setDeleteConfirmOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Book title is required';
    if (!author.trim()) errors.author = 'Author name is required';
    if (!isbn.trim()) errors.isbn = 'ISBN identifier is required';
    
    if (totalCopies < 0 || isNaN(totalCopies)) {
      errors.totalCopies = 'Total copies cannot be negative';
    }
    
    if (availableCopies < 0 || isNaN(availableCopies)) {
      errors.availableCopies = 'Available copies cannot be negative';
    } else if (availableCopies > totalCopies) {
      errors.availableCopies = 'Available copies cannot exceed total copies';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      genre: genre.trim() || undefined,
      totalCopies: Number(totalCopies),
      availableCopies: Number(availableCopies),
    };

    try {
      setSubmitting(true);
      setSuccess('');
      setError('');

      if (selectedBook) {
        // Edit Action
        await api.put(`/books/${selectedBook._id}`, payload);
        setSuccess(`Book '${payload.title}' catalog details updated successfully.`);
      } else {
        // Create Action
        await api.post('/books', payload);
        setSuccess(`Book '${payload.title}' successfully added to catalog.`);
      }

      setFormModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Operation failed. Verify details and ensure ISBN is unique.';
      setFormErrors({ form: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      setSubmitting(true);
      setSuccess('');
      setError('');
      await api.delete(`/books/${selectedBook._id}`);
      setSuccess(`Book '${selectedBook.title}' successfully removed from catalog.`);
      setDeleteConfirmOpen(false);
      fetchBooks();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to remove book from database catalog.');
      setDeleteConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-[#020617] overflow-y-auto transition-colors duration-200 text-slate-800 dark:text-slate-100">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            Books Catalogue System
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse library book stocks, allocate volumes, adjust total copies, and verify availability.
          </p>
        </div>
        <Button
          id="btn-add-book-trigger"
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold py-2.5 shadow-md shadow-emerald-500/10 text-xs uppercase tracking-wider"
        >
          Add Book Title
        </Button>
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

      {/* Search Input Bar */}
      <div className="max-w-md w-full">
        <Input
          id="input-books-search"
          type="text"
          placeholder="Search by Title, Author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          helperText={search ? 'Retrieving matching queries from backend...' : ''}
        />
      </div>

      {/* Main Catalog Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col justify-center items-center gap-4 text-slate-400">
            <svg
              className="animate-spin h-8 w-8 text-emerald-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs font-semibold">Contacting Books Catalog Database...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="p-16 text-center space-y-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-800">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">Catalog is Empty</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400">
                {search ? 'No catalog titles matched your search query.' : 'There are currently no book titles registered in this library.'}
              </p>
            </div>
            {!search && (
              <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                Add First Book Title
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">ISBN</th>
                  <th className="px-6 py-4">Genre</th>
                  <th className="px-6 py-4 text-center">Total Copies</th>
                  <th className="px-6 py-4 text-center">Available Copies</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Control Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 bg-white/30 dark:bg-transparent">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-200/20 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-955 dark:text-white max-w-xs truncate">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-200">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                      {book.isbn}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-450">
                      {book.genre || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-center text-slate-800 dark:text-slate-200">
                      {book.totalCopies}
                    </td>
                    <td className="px-6 py-4 font-bold text-center text-slate-950 dark:text-white">
                      {book.availableCopies}
                    </td>
                    <td className="px-6 py-4">
                      {book.availableCopies === 0 ? (
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-full uppercase tracking-wider">
                          Out of Stock
                        </span>
                      ) : book.availableCopies <= 2 ? (
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-full uppercase tracking-wider">
                          Low Stock ({book.availableCopies} left)
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/30 rounded-full uppercase tracking-wider">
                          In Stock ({book.availableCopies} left)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(book)}
                          className="p-1.5 rounded bg-slate-105 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                          title="Modify Book Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(book)}
                          className="p-1.5 rounded bg-rose-50 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500 hover:text-rose-650 transition-colors focus:outline-none"
                          title="Remove Title from Catalogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedBook ? 'Modify Catalog Book Details' : 'Register New Book Title'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formErrors.form && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex gap-2.5 items-center animate-fade-in text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{formErrors.form}</span>
            </div>
          )}

          <Input
            id="field-book-title"
            label="Book Title"
            placeholder="e.g. The Hobbit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={formErrors.title}
            leftIcon={<BookOpen className="w-4 h-4" />}
          />

          <Input
            id="field-book-author"
            label="Author Name"
            placeholder="e.g. J.R.R. Tolkien"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            error={formErrors.author}
            leftIcon={<Bookmark className="w-4 h-4" />}
          />

          <Input
            id="field-book-isbn"
            label="ISBN Number"
            placeholder="e.g. 9780261102217"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            error={formErrors.isbn}
            leftIcon={<Hash className="w-4 h-4" />}
          />

          <Input
            id="field-book-genre"
            label="Genre / Category"
            placeholder="e.g. Fantasy"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            leftIcon={<FolderOpen className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="field-book-total"
              label="Total Copies"
              type="number"
              min="0"
              value={totalCopies}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTotalCopies(val);
                // When creating a new book, sync available copies to total copies automatically
                if (!selectedBook) {
                  setAvailableCopies(val);
                }
              }}
              error={formErrors.totalCopies}
              leftIcon={<Layers className="w-4 h-4" />}
            />

            <Input
              id="field-book-available"
              label="Available Copies"
              type="number"
              min="0"
              value={availableCopies}
              onChange={(e) => setAvailableCopies(Number(e.target.value))}
              error={formErrors.availableCopies}
              leftIcon={<Sliders className="w-4 h-4" />}
              helperText={selectedBook ? "Cannot exceed total copies" : "Synced to total copies"}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-6">
            <Button
              id="btn-cancel-book-form"
              type="button"
              variant="outline"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="btn-save-book-form"
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              {selectedBook ? 'Save Changes' : 'Add Title'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Remove Book from Catalogue?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">'{selectedBook?.title}'</strong> by {selectedBook?.author} (ISBN: {selectedBook?.isbn}) from the catalog? This action will remove all copies and details from the library system.
          </p>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-6">
            <Button
              id="btn-cancel-book-delete"
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              No, Keep Book
            </Button>
            <Button
              id="btn-confirm-book-delete"
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={submitting}
            >
              Yes, Remove Book
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
