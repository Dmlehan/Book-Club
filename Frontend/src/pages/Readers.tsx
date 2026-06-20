import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import Modal from '../components/Modal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Hash, 
  User, 
  Calendar 
} from 'lucide-react';

interface Reader {
  _id: string;
  readerId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function Readers() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Control
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);

  // Form Fields
  const [readerId, setReaderId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReaders();
  }, []);

  const fetchReaders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/readers');
      setReaders(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load registered readers from server database.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedReader(null);
    setReaderId('');
    setName('');
    setEmail('');
    setPhone('');
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = (reader: Reader) => {
    setSelectedReader(reader);
    setReaderId(reader.readerId);
    setName(reader.name);
    setEmail(reader.email);
    setPhone(reader.phone);
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenDelete = (reader: Reader) => {
    setSelectedReader(reader);
    setDeleteConfirmOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!readerId.trim()) errors.readerId = 'Reader ID is required';
    if (!name.trim()) errors.name = 'Full Name is required';
    
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!phone.trim()) errors.phone = 'Phone number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      readerId: readerId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim()
    };

    try {
      setSubmitting(true);
      setSuccess('');
      setError('');

      if (selectedReader) {
        // Update Action
        await api.put(`/readers/${selectedReader._id}`, payload);
        setSuccess(`Patron '${payload.name}' profile updated successfully.`);
      } else {
        // Create Action
        await api.post('/readers', payload);
        setSuccess(`Patron '${payload.name}' registered successfully.`);
      }

      setFormModalOpen(false);
      fetchReaders();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Operation failed. Verify inputs are correct and unique.';
      setFormErrors({ form: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReader) return;

    try {
      setSubmitting(true);
      setSuccess('');
      setError('');
      await api.delete(`/readers/${selectedReader._id}`);
      setSuccess(`Patron '${selectedReader.name}' membership removed successfully.`);
      setDeleteConfirmOpen(false);
      fetchReaders();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to remove reader membership.');
      setDeleteConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter readers list client side based on query input
  const filteredReaders = readers.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.readerId.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredReaders.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedReaders = filteredReaders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-[#020617] overflow-y-auto transition-colors duration-200 text-slate-800 dark:text-slate-100">
      
      {/* Title & Register Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            Reader Registry Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register new patrons, adjust details, and manage membership access parameters.
          </p>
        </div>
        <Button
          id="btn-register-reader-trigger"
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="font-bold py-2.5 shadow-md shadow-emerald-500/10 text-xs uppercase tracking-wider"
        >
          Register Reader
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

      {/* Filter / Search Bar */}
      <div className="max-w-md w-full">
        <Input
          id="input-readers-search"
          type="text"
          placeholder="Filter registry by ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Main Registry Table Container */}
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
            <span className="text-xs font-semibold">Contacting Registry Database...</span>
          </div>
        ) : filteredReaders.length === 0 ? (
          <div className="p-16 text-center space-y-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-800">
              <Users className="w-7 h-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">No Patrons Found</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400">
                {search ? 'No results matched your search query. Try another input.' : 'The registry database does not contain registered reader files.'}
              </p>
            </div>
            {!search && (
              <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                Register First Patron
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-4">Reader ID</th>
                    <th className="px-6 py-4">Patron Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 bg-white/30 dark:bg-transparent">
                  {paginatedReaders.map((reader) => (
                    <tr key={reader._id} className="hover:bg-slate-200/20 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {reader.readerId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-955 dark:text-white">
                        {reader.name}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{reader.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{reader.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-450 dark:text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(reader.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(reader)}
                            className="p-1.5 rounded bg-slate-105 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                            title="Modify Patron Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(reader)}
                            className="p-1.5 rounded bg-rose-50 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500 hover:text-rose-650 transition-colors focus:outline-none"
                            title="Revoke Patron Access"
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
            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{filteredReaders.length > 0 ? startIndex + 1 : 0}</span> to{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(startIndex + itemsPerPage, filteredReaders.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900 dark:text-white">{filteredReaders.length}</span> patrons
              </span>
              <div className="flex items-center gap-2">
                <Button
                  id="btn-readers-prev"
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
                  id="btn-readers-next"
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

      {/* CRUD Form Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedReader ? 'Modify Reader Membership' : 'Register New Reader Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formErrors.form && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex gap-2.5 items-center animate-fade-in text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{formErrors.form}</span>
            </div>
          )}

          <Input
            id="field-reader-id"
            label="Reader ID"
            placeholder="e.g. R202601"
            value={readerId}
            onChange={(e) => setReaderId(e.target.value)}
            error={formErrors.readerId}
            leftIcon={<Hash className="w-4 h-4" />}
            disabled={!!selectedReader} // ID cannot be updated
          />

          <Input
            id="field-reader-name"
            label="Patron Name"
            placeholder="e.g. Alice Cooper"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            id="field-reader-email"
            label="Email Address"
            type="email"
            placeholder="e.g. alice.cooper@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            id="field-reader-phone"
            label="Phone Number"
            placeholder="e.g. +1 555 0199"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={formErrors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-6">
            <Button
              id="btn-cancel-reader-form"
              type="button"
              variant="outline"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="btn-save-reader-form"
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              {selectedReader ? 'Save Changes' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Revoke Reader Membership?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to revoke the membership of patron <strong className="text-slate-900 dark:text-white">'{selectedReader?.name}'</strong> (ID: {selectedReader?.readerId})? This action will remove all history and profile data from the database.
          </p>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-6">
            <Button
              id="btn-cancel-reader-delete"
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              No, Keep Member
            </Button>
            <Button
              id="btn-confirm-reader-delete"
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={submitting}
            >
              Yes, Revoke Member
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
