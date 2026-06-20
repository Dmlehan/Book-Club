import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BookOpen, User, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex justify-center items-center min-h-[calc(100vh-64px)] bg-cover bg-center relative p-4"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.85), rgba(2, 6, 23, 0.95)), url('/assets/library_login_bg.png')`,
      }}
    >
      {/* Dynamic background glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main glassmorphic login card container */}
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 shadow-2xl relative z-10 animate-scale-in">
        
        {/* Brand / Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 transform hover:rotate-6 transition-transform duration-300">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">
            Staff Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Book-Club Library Hub
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex gap-2.5 items-start mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span className="text-xs text-rose-300 font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="login-username"
            label="Staff Username"
            type="text"
            placeholder="e.g. jdoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            autoFocus
          />

          <Input
            id="login-password"
            label="Staff Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex justify-between items-center text-xs mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                className="accent-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-0"
              />
              <span>Remember me</span>
            </label>
            <span className="text-slate-500 hover:text-emerald-400 cursor-help transition-colors">
              Forgot password?
            </span>
          </div>

          <Button
            id="btn-login-submit"
            type="submit"
            variant="primary"
            className="w-full mt-4 text-sm py-3 font-bold"
            isLoading={loading}
          >
            Authenticate Portal
          </Button>
        </form>

        {/* Info footer */}
        <p className="text-center text-xs text-slate-500 mt-8 leading-relaxed">
          Authorized library personnel access only. Actions within this system are audited.
        </p>

      </div>
    </div>
  );
}
