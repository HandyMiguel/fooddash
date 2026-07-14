import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-400">
        {/* Top Header Bar */}
        <header className="h-20 glass border-b border-[var(--color-border-card)] sticky top-0 z-20 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-6">
             <div className="hidden md:block">
               <h2 className="text-lg font-bold text-[var(--color-text)]">Bonjour, {user?.prenom} 👋</h2>
               <p className="text-xs font-semibold text-[var(--color-text-secondary)] capitalize">{date}</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
              <input 
                type="text" 
                placeholder="Recherche globale..." 
                className="w-64 pl-10 pr-4 py-2 rounded-full text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-muted)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
              />
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-white text-slate-600 hover:text-[var(--color-primary)] hover:bg-emerald-50 transition-colors relative shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
               {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 flex-1 max-w-[1600px] w-full mx-auto relative">
          <Outlet />
        </div>
      </main>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          className: 'glass !rounded-xl !shadow-xl !border !border-[var(--color-border-card)]',
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text)',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px',
            backdropFilter: 'blur(12px)',
          },
          success: { 
            iconTheme: { primary: 'var(--color-success)', secondary: '#fff' } 
          },
          error: { 
            iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' } 
          },
        }}
      />
    </div>
  );
}
