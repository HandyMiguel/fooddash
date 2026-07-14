// pages/Favoris.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2, Plus, Star, Clock } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Favoris() {
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const { addToCart } = useCart();
  const [allPlats, setAllPlats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPlats();
  }, []);

  const loadAllPlats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plats');
      const data = Array.isArray(res.data) ? res.data : res.data?.plats ?? [];
      setAllPlats(data);
    } catch (error) {
      console.error('Erreur chargement plats');
    } finally {
      setLoading(false);
    }
  };

  const favoritePlats = allPlats.filter(plat => isFavorite(plat.id));

  const handleRemove = async (platId, nom) => {
    await toggleFavorite(platId);
    toast.success(`${nom} retiré des favoris`);
  };

  const handleAddToCart = (plat) => {
    if (plat.disponible !== false) {
      addToCart(plat);
      toast.success(`${plat.nom} ajouté au panier !`);
    } else {
      toast.error('Ce plat est actuellement indisponible');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Retour au menu
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 flex items-center justify-center shadow-sm">
              <Heart size={22} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Mes Favoris</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                {favoritePlats.length} plat{favoritePlats.length > 1 ? 's' : ''} sauvegardé{favoritePlats.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading || favLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden h-90 animate-pulse">
                <div className="h-44 bg-gray-100 dark:bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-lg w-2/3" />
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-full" />
                  <div className="h-6 bg-gray-100 dark:bg-white/5 rounded-lg w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : favoritePlats.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Heart size={36} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              Aucun favori
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed font-medium">
              Cliquez sur le cœur sur les fiches des plats pour les ajouter à vos favoris et les retrouver ici
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 hover:translate-y-[-1px] transition duration-300"
            >
              🍽️ Découvrir le menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoritePlats.map(plat => (
              <div
                key={plat.id}
                className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 dark:hover:border-red-500/30 shadow-sm hover:shadow-lg hover:shadow-red-500/5 dark:hover:shadow-red-500/2 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-gradient-to-br from-red-500/10 to-pink-500/10 dark:from-red-500/15 dark:to-pink-500/15 flex items-center justify-center text-5xl">
                    🍽️
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(plat.id, plat.nom)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-500 transition-all duration-300 flex items-center justify-center hover:scale-105"
                      title="Retirer des favoris"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Category */}
                    <span className="absolute top-3 left-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {plat.categorie || 'Non classé'}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                      {plat.nom}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {plat.description || 'Délicieux plat préparé par nos chefs'}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span>4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} />
                        <span>15-20 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between mt-1 pt-4 border-t border-gray-50 dark:border-white/5">
                    <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {Number(plat.prix || 0).toFixed(2)} €
                    </span>

                    <button
                      onClick={() => handleAddToCart(plat)}
                      disabled={plat.disponible === false}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-[0px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                    >
                      <Plus size={14} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}