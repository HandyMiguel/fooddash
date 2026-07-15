import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import SuiviCommande from './pages/SuiviCommande';
import AdminDashboard from './pages/AdminDashboard';
import AdminCommandes from './pages/AdminCommandes';
import AdminPlats from './pages/AdminPlats';
import AdminSettings from './pages/AdminSettings';
import ProfilAdmin from './pages/ProfilAdmin';
import AdminChat from './pages/AdminChat';
import LiveChat from './components/LiveChat';
import { AnimatePresence } from 'framer-motion';
import Favoris from './pages/favoris';
import Profil from './pages/Profil';
import LivreurLayout from './layouts/LivreurLayout';
import LivreurDashboard from './pages/LivreurDashboard';
import LivreurDisponibles from './pages/LivreurDisponibles';
import LivreurProfil from './pages/LivreurProfil';

const TOAST_CONFIG = {
  duration: 3500,
  style: {
    background: '#13131A',
    color: '#fff',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    padding: '12px 16px',
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '600',
  },
};

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== 'admin') return <Navigate to="/menu" replace />;
  return children;
}

function LivreurRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== 'livreur') return <Navigate to="/login" replace />;
  return children;
}

function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-[#0A0A0F]">
      <div className="relative flex flex-col items-center gap-6">
        {/* Outer glow ring */}
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF3366] opacity-20 blur-2xl animate-pulse" />

        {/* Logo container */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center shadow-2xl shadow-[#FF6B35]/30 animate-pulse-glow">
          <span className="text-3xl">🍔</span>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-white/40 border-r-white/20 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-2xl font-black gradient-text-warm tracking-tight">FoodDash</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">Chargement en cours…</p>
        </div>

        {/* Dots loader */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"
              style={{
                animation: 'bounce 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-right" toastOptions={TOAST_CONFIG} />
      </>
    );
  }

  if (user?.role === 'admin') {
    return (
      <AdminLayout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/commandes" element={<AdminRoute><AdminCommandes /></AdminRoute>} />
            <Route path="/admin/plats" element={<AdminRoute><AdminPlats /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/chat" element={<AdminRoute><AdminChat /></AdminRoute>} />
            <Route path="/profil" element={<AdminRoute><ProfilAdmin /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-right" toastOptions={TOAST_CONFIG} />
      </AdminLayout>
    );
  }

  if (user?.role === 'livreur') {
    return (
      <LivreurLayout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/livreur" element={<LivreurRoute><LivreurDashboard /></LivreurRoute>} />
            <Route path="/livreur/disponibles" element={<LivreurRoute><LivreurDisponibles /></LivreurRoute>} />
            <Route path="/profil" element={<LivreurRoute><LivreurProfil /></LivreurRoute>} />
            <Route path="*" element={<Navigate to="/livreur" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-right" toastOptions={TOAST_CONFIG} />
      </LivreurLayout>
    );
  }

  return (
    <ClientLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
          <Route path="/commandes" element={<PrivateRoute><SuiviCommande /></PrivateRoute>} />
          <Route path="/favoris" element={<PrivateRoute><Favoris /></PrivateRoute>} />
          <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </AnimatePresence>
      <LiveChat />
      <Toaster
        position="top-right"
        toastOptions={{
          ...TOAST_CONFIG,
          success: {
            icon: '✅',
            style: { ...TOAST_CONFIG.style, background: '#064E3B', border: '1px solid rgba(16,185,129,0.3)' },
          },
          error: {
            icon: '❌',
            style: { ...TOAST_CONFIG.style, background: '#450A0A', border: '1px solid rgba(239,68,68,0.3)' },
          },
        }}
      />
    </ClientLayout>
  );
}