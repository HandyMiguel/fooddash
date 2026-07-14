// pages/LivreurDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, ShoppingBag, CheckCircle, Activity,
  MapPin, Phone, MessageSquare, Clock, ArrowRight,
  TrendingUp, Award, Power, Bike, MapPinned
} from 'lucide-react';

export default function LivreurDashboard() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const [disponibilite, setDisponibilite] = useState(user?.disponible || false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setDisponibilite(user?.disponible || false);
  }, [user]);

  useEffect(() => {
    loadDeliveries();
  }, [refreshKey]);

  const loadDeliveries = async () => {
    try {
      const res = await api.get('/commandes/livreur/mes-livraisons');
      setCommandes(res.data);
    } catch (e) {
      toast.error('Erreur lors du chargement de vos livraisons');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    const newVal = !disponibilite;
    try {
      // Mettre à jour le profil de l'utilisateur
      await api.put('/auth/profile', { disponible: newVal });
      setDisponibilite(newVal);
      // Mettre à jour l'utilisateur dans le local storage pour synchroniser le state global
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.disponible = newVal;
      localStorage.setItem('user', JSON.stringify(storedUser));
      // Optionnel: rafraîchir l'application (normalement le context met à jour l'utilisateur)
      toast.success(newVal ? 'Vous êtes maintenant en ligne ! 🟢' : 'Vous êtes hors ligne 🔴');
      window.location.reload(); // Pour forcer la synchro de l'état d'auth sans prise de tête
    } catch (e) {
      toast.error('Erreur lors du changement de disponibilité');
    }
  };

  const deliverOrder = async (id) => {
    try {
      await api.put(`/commandes/${id}/livrer`);
      toast.success('Commande livrée ! Bien joué 🏆');
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  // Calcul des statistiques
  const livrees = commandes.filter(c => c.statut === 'livree');
  const actives = commandes.filter(c => c.statut === 'en_livraison');
  const revenus = livrees.reduce((sum, c) => sum + parseFloat(c.total), 0) * 0.15; // disons 15% de commission par livraison

  return (
    <div className="space-y-8 text-gray-800 dark:text-gray-100">
      {/* En-tête du tableau de bord */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez votre activité et suivez vos livraisons actives.</p>
        </div>

        {/* Toggler de disponibilité */}
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl border font-bold transition-all duration-300 shadow-lg ${
            disponibilite
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] shadow-[#10b981]/5'
              : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/5'
          }`}
        >
          <Power className={`w-5 h-5 ${disponibilite ? 'animate-pulse' : ''}`} />
          <span>{disponibilite ? 'En Ligne (Disponible)' : 'Hors Ligne (Occupé)'}</span>
        </button>
      </div>

      {/* Widgets Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Earnings */}
        <div className="bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden flex items-center justify-between shadow-sm">
          <div className="space-y-2 z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Mes Gains (15% commission)</span>
            <span className="text-3xl font-black block text-gray-900 dark:text-white">
              {revenus.toFixed(2)} €
            </span>
            <div className="flex items-center gap-1 text-xs text-[#10b981] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gains accumulés</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 z-10">
            <Coins className="w-6 h-6" />
          </div>
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-orange-500/5 blur-xl pointer-events-none" />
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden flex items-center justify-between shadow-sm">
          <div className="space-y-2 z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Livraisons effectuées</span>
            <span className="text-3xl font-black block text-gray-900 dark:text-white">{livrees.length}</span>
            <div className="flex items-center gap-1 text-xs text-[#10b981] font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Super livreur</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] z-10">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-[#10b981]/5 blur-xl pointer-events-none" />
        </div>

        {/* Total Orders processed */}
        <div className="bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden flex items-center justify-between shadow-sm">
          <div className="space-y-2 z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Livraisons en cours</span>
            <span className="text-3xl font-black block text-gray-900 dark:text-white">{actives.length}</span>
            <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Actives en route</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 z-10">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Livraisons Actives */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span>Livraisons Actives</span>
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
            {actives.length}
          </span>
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : actives.length === 0 ? (
          <div className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-3xl">
              🛵
            </div>
            <h3 className="text-lg font-black">Aucune livraison en cours</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              Vous n'avez pas de commande en cours de livraison. Allez dans "Disponibles" pour en accepter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence>
              {actives.map(commande => (
                <motion.div
                  key={commande.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-md relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Commande Header */}
                    <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4">
                      <div>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Commande #{commande.id}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                          <span className="text-xs font-bold text-blue-500">En cours de livraison</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-medium">Prix total client</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {parseFloat(commande.total).toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    {/* Client et Adresse */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-gray-400 block font-medium">Adresse de livraison</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                            {commande.adresseLivraison}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 mt-0.5">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-gray-400 block font-medium">Contact Client ({commande.User?.nom})</span>
                          <a
                            href={`tel:${commande.User?.telephone}`}
                            className="text-sm font-bold text-[#FF6B35] hover:underline"
                          >
                            {commande.User?.telephone || 'Aucun numéro'}
                          </a>
                        </div>
                      </div>

                      {commande.notes && (
                        <div className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/10 p-3 rounded-xl">
                          <MessageSquare className="w-4 h-4 text-orange-500 mt-0.5" />
                          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            <strong>Note :</strong> {commande.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Plats commandés */}
                    <div className="bg-gray-50 dark:bg-white/2 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Articles</span>
                      {commande.Plats?.map(plat => (
                        <div key={plat.id} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {plat.CommandePlat?.quantite}x {plat.nom}
                          </span>
                          <span className="text-gray-400 font-medium">
                            {(plat.CommandePlat?.prixUnitaire * plat.CommandePlat?.quantite).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6">
                    <button
                      onClick={() => deliverOrder(commande.id)}
                      className="w-full gradient-btn font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/20"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Marquer comme livrée</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
