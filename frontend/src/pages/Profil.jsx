// pages/Profil.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, Mail, Phone, MapPin, Moon, Sun, LogOut, 
  Edit2, Save, X, Lock, Trash2, Shield, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Profil() {
  const { user, logout, setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    if (!form.nom.trim() || !form.email.trim()) {
      toast.error('Le nom et l\'email sont requis');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/profile', form);
      toast.success('Profil mis à jour !');
      if (setUser) {
        setUser(prev => ({ ...prev, ...form }));
      }
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || ''
    });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Mot de passe modifié !');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/auth/account');
      toast.success('Compte supprimé');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Mon Profil
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 text-center mb-6 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-lg shadow-primary/20">
            {user?.nom?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user?.nom}
          </h2>
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            user?.role === 'admin' 
              ? 'bg-purple-500/10 border border-purple-500/20 text-purple-500' 
              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
          }`}>
            <Shield size={12} />
            {user?.role === 'admin' ? 'Administrateur' : 'Client'}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
              Informations personnelles
            </h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 text-gray-600 dark:text-gray-300 text-xs font-bold transition-all duration-250 cursor-pointer"
              >
                <Edit2 size={13} /> Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg transition duration-250 cursor-pointer"
                >
                  <Save size={13} /> Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition duration-250 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Nom Input/Label */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl">
              <User size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              {editing ? (
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full bg-transparent border-none text-sm text-gray-900 dark:text-white focus:outline-none"
                />
              ) : (
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.nom}</span>
              )}
            </div>

            {/* Email Input/Label */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl">
              <Mail size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              {editing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-none text-sm text-gray-900 dark:text-white focus:outline-none"
                />
              ) : (
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</span>
              )}
            </div>

            {/* Telephone Input/Label */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl">
              <Phone size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              {editing ? (
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="Non renseigné"
                  className="w-full bg-transparent border-none text-sm text-gray-900 dark:text-white focus:outline-none"
                />
              ) : (
                <span className={`text-sm ${user?.telephone ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                  {user?.telephone || 'Non renseigné'}
                </span>
              )}
            </div>

            {/* Adresse Input/Label */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl">
              <MapPin size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              {editing ? (
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  placeholder="Non renseignée"
                  className="w-full bg-transparent border-none text-sm text-gray-900 dark:text-white focus:outline-none"
                />
              ) : (
                <span className={`text-sm ${user?.adresse ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                  {user?.adresse || 'Non renseignée'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-5">
            Préférences
          </h3>
          
          {/* Dark Mode Switcher */}
          <div 
            onClick={toggle}
            className="flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-white/2 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl cursor-pointer transition-colors duration-250 mb-3"
          >
            <div className="flex items-center gap-3">
              {dark ? (
                <Moon size={15} className="text-gray-400 dark:text-gray-500" />
              ) : (
                <Sun size={15} className="text-amber-500" />
              )}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mode sombre</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${dark ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all duration-300 shadow-md ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Change Password Trigger */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-white/2 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-left cursor-pointer transition-colors duration-250 font-semibold"
          >
            <Lock size={15} className="text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Changer le mot de passe</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/30 dark:bg-red-500/2 border border-red-200 dark:border-red-500/10 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-[10px] font-extrabold text-red-500 tracking-wider uppercase mb-5">
            Zone de danger
          </h3>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/25 rounded-xl text-left cursor-pointer transition-all duration-250 font-semibold"
          >
            <Trash2 size={16} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-500">Supprimer mon compte</p>
              <p className="text-[11px] text-red-400 dark:text-red-400/60 font-medium mt-0.5">Cette action est irréversible et efface vos données</p>
            </div>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white font-bold text-sm transition-all duration-250 cursor-pointer"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-250">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Nouveau mot de passe
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-200"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-primary transition"
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-primary transition"
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-primary transition"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold text-sm mt-6 shadow-md shadow-primary/10 hover:shadow-lg transition duration-250 disabled:opacity-50"
            >
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 border border-red-500/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-250">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} />
            </div>
            <h2 className="text-lg font-extrabold text-red-500 mb-2">
              Supprimer votre compte ?
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 px-2">
              Cette action est irréversible. Toutes vos données seront définitivement supprimées de nos serveurs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 text-gray-600 dark:text-gray-300 text-xs font-bold transition duration-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}