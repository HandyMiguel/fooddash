// pages/LivreurDisponibles.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, Clock, ArrowRight,
  TrendingUp, Compass, AlertCircle, ShoppingBag
} from 'lucide-react';

export default function LivreurDisponibles() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDisponibles();
  }, []);

  const loadDisponibles = async () => {
    try {
      const res = await api.get('/commandes/livreur/disponibles');
      setCommandes(res.data);
    } catch (e) {
      toast.error('Erreur lors du chargement des commandes disponibles');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (id) => {
    try {
      await api.put(`/commandes/${id}/accepter`);
      toast.success('Livraison acceptée ! En route ! 🛵');
      navigate('/livreur');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de l\'acceptation');
      loadDisponibles();
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Si le livreur n'est pas disponible, on lui affiche un avertissement
  if (!user?.disponible) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 text-gray-800 dark:text-gray-100">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black">Vous êtes hors ligne 🔴</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Vous devez définir votre statut comme **"Disponible"** pour voir et accepter des commandes. 
            Activez votre statut sur votre tableau de bord ou votre page de profil pour commencer à recevoir des courses.
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              await api.put('/auth/profile', { disponible: true });
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              storedUser.disponible = true;
              localStorage.setItem('user', JSON.stringify(storedUser));
              toast.success('Vous êtes maintenant en ligne ! 🟢');
              window.location.reload();
            } catch (e) {
              toast.error('Erreur lors du changement de disponibilité');
            }
          }}
          className="gradient-btn font-bold px-8 py-3.5 rounded-xl cursor-pointer shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          Se mettre en ligne
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-800 dark:text-gray-100">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#13131A] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Compass className="w-8 h-8 text-orange-500" />
            <span>Commandes Disponibles</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Parcourez les commandes prêtes en cuisine et acceptez-les pour livraison.
          </p>
        </div>

        <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          <span>Recherche en cours...</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : commandes.length === 0 ? (
        <div className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/5 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4 text-orange-500 animate-bounce">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black">Aucune commande disponible</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Toutes les commandes ont été prises en charge. Restez en ligne, de nouvelles commandes arrivent constamment !
          </p>
          <button
            onClick={loadDisponibles}
            className="mt-6 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
          >
            Actualiser
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commandes.map((commande) => {
            const estim = parseFloat(commande.total) * 0.15;
            return (
              <motion.div
                key={commande.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block uppercase">Livraison</span>
                      <span className="text-base font-black">Commande #{commande.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(commande.createdAt)}</span>
                    </div>
                  </div>

                  {/* Estimation gain */}
                  <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-bold">Votre gain estimé</span>
                    </div>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      +{estim.toFixed(2)} €
                    </span>
                  </div>

                  {/* Détails adresse et plats */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Destination</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                          {commande.adresseLivraison}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Client</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {commande.User?.nom}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panier résumé */}
                  <div className="bg-gray-50 dark:bg-white/2 p-3 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Articles</span>
                    {commande.Plats?.map(plat => (
                      <div key={plat.id} className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {plat.CommandePlat?.quantite}x {plat.nom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton d'action */}
                <button
                  onClick={() => acceptOrder(commande.id)}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                  <span>Prendre la livraison</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
