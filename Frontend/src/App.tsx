import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Readers from './pages/Readers';
import Books from './pages/Books';
import Dashboard from './pages/Dashboard';

// Protected Route Wrapper Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
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
        <span className="text-sm font-semibold text-slate-400">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main Layout Wrapper displaying Sidebar + Navbar + Content Outlet
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Placeholder view for unfinished phases
const PlaceholderPage = ({ name, description }: { name: string; description: string }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-1/3 left-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
      <div className="glass-panel max-w-lg w-full rounded-2xl p-8 text-center space-y-4 shadow-xl z-10 animate-scale-in">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        <div className="inline-block px-3 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-800/30 rounded-full uppercase tracking-widest">
          Scheduled Development Phase
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="readers" element={<Readers />} />
              <Route 
                path="lending" 
                element={
                  <PlaceholderPage 
                    name="Lending & Transaction Desk" 
                    description="Automated book checkouts, reader autocomplete filters, and return due date calculations will be implemented in Phase 6." 
                  />
                } 
              />
              <Route 
                path="overdue" 
                element={
                  <PlaceholderPage 
                    name="Overdue Delinquencies Panel" 
                    description="Lending logs matching overdue dates, patreon contacts lists, and automated reminder alerts will be implemented in Phase 6." 
                  />
                } 
              />
            </Route>

            {/* Redirect all unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
