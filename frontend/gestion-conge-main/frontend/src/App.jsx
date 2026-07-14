import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Etudiants from './pages/Etudiants';
import Enseignants from './pages/Enseignants';
import MentionsParcours from './pages/MentionsParcours';
import Niveaux from './pages/Niveaux';
import ModulesMatieres from './pages/ModulesMatieres';
import Notes from './pages/Notes';
import AnneesSession from './pages/AnneesSession';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="etudiants" element={<Etudiants />} />
            <Route path="enseignants" element={<Enseignants />} />
            <Route path="mentions-parcours" element={<MentionsParcours />} />
            <Route path="niveaux" element={<Niveaux />} />
            <Route path="modules-matieres" element={<ModulesMatieres />} />
            <Route path="notes" element={<Notes />} />
            <Route path="annees-sessions" element={<AnneesSession />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
