// pages/SuiviCommande.jsx
import { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronDown, Check, ChefHat, Package, Utensils, Ban, Bike, RefreshCw } from 'lucide-react';
import api from '../services/api';

const statutSteps = [
  { key: 'en_attente',    label: 'En attente',     icon: Clock,    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  emoji: '⏳' },
  { key: 'confirmee',     label: 'Confirmée',      icon: Check,    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)',  emoji: '✅' },
  { key: 'en_preparation',label: 'En préparation', icon: ChefHat,  color: '#FF6B35', bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.3)',  emoji: '👨‍🍳' },
  { key: 'prete',         label: 'Prête',           icon: Package,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)',  emoji: '📦' },
  { key: 'en_livraison',  label: 'En livraison',   icon: Bike,     color: '#FF6B35', bg: 'rgba(255,107,53,0.12)',  border: 'rgba(255,107,53,0.3)',  emoji: '🛵' },
  { key: 'livree',        label: 'Livrée',          icon: Check,    color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  emoji: '🏁' },
];

const statutMap = {
  en_attente:    { label: 'En attente',    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  confirmee:     { label: 'Confirmée',     color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  en_preparation:{ label: 'En préparation',color: '#FF6B35', bg: 'rgba(255,107,53,0.1)' },
  prete:         { label: 'Prête',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  en_livraison:  { label: 'En livraison',   color: '#FF6B35', bg: 'rgba(255,107,53,0.1)' },
  livree:        { label: 'Livrée',         color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  annulee:       { label: 'Annulée',        color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function SuiviCommande() {
  const [commandes, setCommandes] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCommandes();
    const interval = setInterval(loadCommandes, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadCommandes = async () => {
    try {
      const res = await api.get('/commandes/mes-commandes');
      setCommandes(Array.isArray(res.data) ? res.data : res.data.commandes ?? []);
    } catch {
      console.error('Erreur chargement commandes');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommandes();
    setTimeout(() => setRefreshing(false), 600);
  };

  const getCurrentStep = (statut) => {
    if (statut === 'annulee') return -1;
    return statutSteps.findIndex(s => s.key === statut);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeliveryEta = (statut, createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const elapsed = Math.floor((now - created) / 60000);
    const totalTime = 35;
    const remaining = Math.max(0, totalTime - elapsed);

    if (statut === 'livree') return null;
    if (statut === 'annulee') return null;
    return remaining > 0 ? `~${remaining} min restantes` : 'Bientôt prêt !';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold mb-4">
              <Clock size={12} />
              Suivi en temps réel
            </div>
            <h1 className="text-3xl font-black tracking-tight">Mes Commandes</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-medium">
              {commandes.length} commande{commandes.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#13131A] border border-gray-200 dark:border-white/8 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-all duration-200 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin-slow' : ''} />
            Actualiser
          </button>
        </div>

        {commandes.length === 0 ? (
          <div className="text-center py-24 max-w-md mx-auto">
            <div className="text-7xl mb-6 animate-float">📦</div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Aucune commande</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Vous n'avez pas encore passé de commande. Découvrez notre menu !
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {commandes.map(commande => {
              const currentStep = getCurrentStep(commande.statut);
              const isExpanded = expandedId === commande.id;
              const isCancelled = commande.statut === 'annulee';
              const isDelivered = commande.statut === 'livree';
              const info = statutMap[commande.statut] || statutMap.en_attente;
              const eta = getDeliveryEta(commande.statut, commande.createdAt);

              return (
                <div
                  key={commande.id}
                  className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/6 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-300"
                >
                  {/* Status top stripe */}
                  <div
                    className="h-1 w-full"
                    style={{
                      background: isCancelled
                        ? '#EF4444'
                        : `linear-gradient(to right, #FF6B35, ${info.color})`,
                    }}
                  />

                  {/* Accordion header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : commande.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors select-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-base font-black text-gray-900 dark:text-white">
                            Commande #{commande.id.toString().slice(-6).toUpperCase()}
                          </h3>
                          {/* Status badge */}
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
                            style={{ background: info.bg, color: info.color }}
                          >
                            {isCancelled ? <Ban size={11} /> : null}
                            {info.label}
                          </span>
                          {/* ETA badge */}
                          {eta && !isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-bold">
                              🕐 {eta}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            <Clock size={12} />
                            {formatDate(commande.createdAt)}
                          </span>
                          {commande.adresseLivraison && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
                              <MapPin size={12} />
                              {commande.adresseLivraison}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black gradient-text-warm">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(commande.total || 0)}
                        </span>
                        <div className={`p-2 rounded-xl border border-gray-200 dark:border-white/8 text-gray-400 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-[#FF6B35]/10 border-[#FF6B35]/20 text-[#FF6B35]' : ''}`}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    {!isCancelled && (
                      <div className="mt-8 relative">
                        {/* Steps */}
                        <div className="flex justify-between relative z-10">
                          {statutSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index <= currentStep;
                            const isCurrent = index === currentStep;
                            return (
                              <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                                <div
                                  className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                    isCurrent ? 'scale-110' : 'scale-100'
                                  }`}
                                  style={isCompleted ? {
                                    background: step.bg,
                                    borderColor: step.border,
                                    color: step.color,
                                    boxShadow: isCurrent ? `0 0 20px ${step.color}50` : 'none',
                                  } : {
                                    background: 'rgba(156,163,175,0.08)',
                                    borderColor: 'rgba(156,163,175,0.15)',
                                    color: '#9CA3AF',
                                  }}
                                >
                                  {isCurrent ? (
                                    <span className="text-sm">{step.emoji}</span>
                                  ) : isCompleted ? (
                                    <Check size={14} />
                                  ) : (
                                    <Icon size={13} />
                                  )}
                                  {/* Pulse ring for current */}
                                  {isCurrent && (
                                    <div
                                      className="absolute inset-0 rounded-full"
                                      style={{
                                        border: `2px solid ${step.color}`,
                                        animation: 'ping-soft 1.5s ease-in-out infinite',
                                      }}
                                    />
                                  )}
                                </div>
                                <span
                                  className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase hidden sm:block text-center"
                                  style={{ color: isCompleted ? step.color : '#9CA3AF' }}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress line */}
                        <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-gray-100 dark:bg-white/5 -z-10 rounded-full">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${(currentStep / (statutSteps.length - 1)) * 100}%`,
                              background: 'linear-gradient(to right, #FF6B35, #FF3366)',
                              boxShadow: '0 0 8px rgba(255,107,53,0.5)',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Cancelled message */}
                    {isCancelled && (
                      <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-red-500/8 border border-red-500/15 rounded-2xl">
                        <Ban size={16} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-500 font-semibold">Cette commande a été annulée.</p>
                      </div>
                    )}

                    {/* Delivered celebration */}
                    {isDelivered && (
                      <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-[#10B981]/8 border border-[#10B981]/15 rounded-2xl">
                        <span className="text-xl">🎉</span>
                        <p className="text-sm text-[#10B981] font-bold">Commande livrée avec succès ! Bon appétit !</p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-white/5 p-6 bg-gray-50/50 dark:bg-white/[0.01]">
                      <h4 className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-5">
                        Détail des plats
                      </h4>
                      <div className="space-y-3">
                        {commande.Plats?.map((plat, idx) => (
                          <div
                            key={plat.id || idx}
                            className="flex justify-between items-center p-4 bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/6 rounded-2xl hover:border-gray-200 dark:hover:border-white/10 transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35]/15 to-[#FF3366]/15 flex items-center justify-center text-2xl flex-shrink-0">
                                🍽️
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{plat.nom}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                  {plat.CommandePlat?.quantite || 1} × {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(plat.CommandePlat?.prixUnitaire || plat.prix)}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-extrabold text-[#10B981]">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                                (plat.CommandePlat?.quantite || 1) * (plat.CommandePlat?.prixUnitaire || plat.prix)
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100 dark:border-white/6">
                        <span className="text-sm font-bold text-gray-400 dark:text-gray-500">Total de la commande</span>
                        <span className="text-2xl font-black gradient-text-warm">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(commande.total || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}