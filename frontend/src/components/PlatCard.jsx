// components/PlatCard.jsx
import { useState } from 'react';
import { Heart, Star, Clock, Plus } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const categoryIcons = {
  'Burgers': '🍔',
  'Pizzas': '🍕',
  'Salades': '🥗',
  'Pâtes': '🍝',
  'Boissons': '🥤',
  'Desserts': '🍰',
};

export default function PlatCard({ plat }) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();

  if (!plat || !plat.id) return null;

  const isFav = isFavorite(plat.id);
  const prix = Number(plat.prix) || 0;
  const promo = Number(plat.promo) || 0;
  const prixFinal = promo > 0 ? prix * (1 - promo / 100) : prix;

  const handleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await toggleFavorite(plat.id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (plat.disponible !== false) {
      addToCart(plat);
      toast.success(`${plat.nom} ajouté au panier !`);
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Image / Icon Container */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 flex items-center justify-center">
          <div
            className={`text-6xl select-none transition-transform duration-500 ease-out ${
              isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
            }`}
          >
            {categoryIcons[plat.categorie] || '🍽️'}
          </div>
          
          {/* Promo Badge */}
          {promo > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md shadow-red-500/20 animate-pulse">
              -{promo}%
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 border ${
              isFav
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-black/30 border-white/10 text-white/70 hover:bg-black/50 hover:text-white'
            }`}
            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart 
              size={14} 
              className={`transition-transform duration-300 ${isFav ? 'fill-red-500 scale-110' : 'scale-100'}`} 
            />
          </button>

          {/* Indisponible Overlay */}
          {plat.disponible === false && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Indisponible
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate flex-1">
              {plat.nom || 'Sans nom'}
            </h3>
            <span className="bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-500 dark:text-gray-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {plat.categorie || 'Non classé'}
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {plat.description || 'Délicieux plat préparé par nos chefs'}
          </p>

          {/* Rating & Time */}
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

      {/* Price & Add to Cart */}
      <div className="p-5 pt-0">
        <div className="flex items-end justify-between mt-1 pt-4 border-t border-gray-50 dark:border-white/5">
          <div>
            {promo > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-600 line-through block mb-0.5">
                {prix.toFixed(2)} €
              </span>
            )}
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
              {prixFinal.toFixed(2)} €
            </span>
          </div>

          {plat.disponible !== false ? (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-[0px] text-white text-xs font-bold transition-all duration-300"
            >
              <Plus size={14} />
              <span>Ajouter</span>
            </button>
          ) : (
            <span className="bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-bold px-3.5 py-2 rounded-xl">
              Indisponible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}