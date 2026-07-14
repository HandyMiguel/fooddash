// pages/LivreurProfil.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Moon, Sun, LogOut, 
  Edit2, Save, X, Lock, Trash2, Bike, Settings, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function LivreurProfil() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    vehicule: user?.vehicule || 'Vélo'
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
      const res = await api.put('/auth/profile', form);
      toast.success('Profil livreur mis à jour !');
      if (setUser) {
        setUser(res.data.user || form);
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
      adresse: user?.adresse || '',
      vehicule: user?.vehicule || 'Vélo'
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
      toast.success('Mot de passe modifié avec succès !');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/auth/account');
      toast.success('Compte livreur supprimé');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-800 dark:text-gray-100">
      
      {/* Profil Header */}
      <div className="bg-white dark:bg-[#13131A] p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center text-4xl text-white font-black shadow-xl shadow-orange-500/20">
          {user?.nom?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl font-black">{user?.nom}</h1>
            <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Livreur
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
          <p className="text-xs text-gray-500">Véhicule : <strong className="text-gray-700 dark:text-gray-300">{user?.vehicule || 'Aucun'}</strong></p>
        </div>
        
        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-md">
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button onClick={handleCancel}
                className="flex items-center gap-2 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all">
                <X className="w-4 h-4" />
                Annuler
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 border border-[#FF6B35] hover:bg-[#FF6B35]/5 text-[#FF6B35] text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm">
              <Edit2 className="w-4 h-4" />
              Modifier le profil
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Info */}
        <div className="lg:col-span-2 bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <h2 className="text-lg font-black flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-3">
            <User className="w-5 h-5 text-orange-500" />
            <span>Informations personnelles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  value={form.nom}
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500/50 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500/50 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="tel"
                  value={form.telephone}
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500/50 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Moyen de transport (Véhicule)</label>
              <div className="relative">
                <Bike className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <select
                  value={form.vehicule}
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, vehicule: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500/50 disabled:opacity-60 transition-all appearance-none"
                >
                  <option value="Vélo">🚲 Vélo</option>
                  <option value="Scooter">🛵 Scooter</option>
                  <option value="Voiture">🚗 Voiture</option>
                  <option value="Trottinette">🛴 Trottinette électrique</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Adresse postale / Zone de livraison</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-4 w-4.5 h-4.5 text-gray-400" />
              <textarea
                value={form.adresse}
                disabled={!editing}
                rows={3}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500/50 disabled:opacity-60 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Security / Actions */}
        <div className="bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-black flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <span>Sécurité</span>
            </h2>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Changer de mot de passe
            </button>
          </div>

          <div className="border-t border-gray-50 dark:border-white/5 pt-6 mt-6 space-y-4">
            <span className="text-xs text-red-500 font-bold block uppercase tracking-wider">Zone de danger</span>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 text-sm font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte livreur
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Password ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/8 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <h3 className="text-lg font-black">Nouveau mot de passe</h3>
            
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none"
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-xs font-bold border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold bg-[#FF6B35] text-white rounded-lg cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Delete Account ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/8 rounded-2xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-red-500">Supprimer le compte définitivement ?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cette action est irréversible. Vous perdrez tout votre historique de livraisons et vos gains accumulés.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-xs font-bold border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer"
              >
                Garder le compte
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold bg-red-500 text-white rounded-lg cursor-pointer"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
