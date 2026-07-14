// pages/Menu.jsx
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import PlatCard from '../components/PlatCard';
import Panier from '../components/Panier';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, ShoppingBag, X, Beef, Pizza, Salad, Soup, Coffee, Cake,
  SlidersHorizontal, Flame, Star, ChevronRight, Sparkles
} from 'lucide-react';

const categories = [
  { name: 'Burgers',  icon: Beef,   color: '#FF6B35', bg: 'rgba(255,107,53,0.12)',  emoji: '🍔' },
  { name: 'Pizzas',   icon: Pizza,  color: '#FF3366', bg: 'rgba(255,51,102,0.12)',  emoji: '🍕' },
  { name: 'Salades',  icon: Salad,  color: '#10B981', bg: 'rgba(16,185,129,0.12)', emoji: '🥗' },
  { name: 'Pâtes',    icon: Soup,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', emoji: '🍝' },
  { name: 'Boissons', icon: Coffee, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', emoji: '🥤' },
  { name: 'Desserts', icon: Cake,   color: '#EC4899', bg: 'rgba(236,72,153,0.12)', emoji: '🍰' },
];

export default function Menu() {
  const { cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const [plats, setPlats] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [categorie, setCategorie] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadPlats();
  }, [categorie]);

  const loadPlats = async () => {
    setLoading(true);
    try {
      const params = categorie ? { categorie } : {};
      const res = await api.get('/plats', { params });
      const data = Array.isArray(res.data) ? res.data : res.data.plats ?? res.data.data ?? [];
      setPlats(data.filter(p => p && p.id));
    } catch {
      setPlats([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlats = useMemo(() => {
    return plats
      .filter(p => p && p.nom)
      .filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'price-asc')  return (a.prix || 0) - (b.prix || 0);
        if (sortBy === 'price-desc') return (b.prix || 0) - (a.prix || 0);
        if (sortBy === 'promo')      return (b.promo || 0) - (a.promo || 0);
        return 0;
      });
  }, [plats, searchTerm, sortBy]);

  // Recommandés = 3 premiers plats disponibles
  const recommandes = useMemo(() =>
    plats.filter(p => p && p.id && p.disponible !== false).slice(0, 3),
  [plats]);

  const activeCategory = categories.find(c => c.name === categorie);

  const sortOptions = [
    { value: 'default',    label: 'Par défaut' },
    { value: 'price-asc',  label: '💰 Prix croissant' },
    { value: 'price-desc', label: '💎 Prix décroissant' },
    { value: 'promo',      label: '🔥 Promotions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl mb-10 p-8 sm:p-10">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#FF3366] to-[#7C3AED] opacity-90" />
          {/* Noise */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Floating emojis */}
          <div className="absolute right-6 top-4 text-5xl sm:text-7xl opacity-25 animate-float select-none pointer-events-none">🍔</div>
          <div className="absolute right-24 bottom-2 text-3xl opacity-20 animate-float-slow select-none pointer-events-none" style={{ animationDelay: '2s' }}>🍕</div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold mb-4">
              <Sparkles size={12} />
              Bonjour, {user?.nom?.split(' ')[0] || 'Chef'} 👋
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              Qu'est-ce qui vous<br />
              <span className="text-white/80">fait envie aujourd'hui ?</span>
            </h1>
            <p className="text-white/70 text-sm font-medium mb-6">
              {plats.length} plats disponibles · Livraison 25 min · Noté 4.9 ⭐
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '🔥', label: 'Livraison rapide' },
                { icon: '⭐', label: 'Noté 4.9/5' },
                { icon: '💰', label: 'Prix doux' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3.5 py-2 bg-white/12 border border-white/20 rounded-xl text-white text-xs font-bold">
                  <span>{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recommandés pour vous ── */}
        {!loading && recommandes.length > 0 && !searchTerm && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center">
                  <Flame size={15} className="text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Recommandés pour vous</h2>
              </div>
              <button className="flex items-center gap-1 text-xs text-[#FF6B35] font-bold hover:underline">
                Voir tout <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommandes.map((plat, i) => (
                <PlatCard key={plat.id} plat={plat} featured={true} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Category Pills ── */}
        <div className="mb-7">
          <h2 className="text-sm font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Catégories
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar scroll-smooth -mx-1 px-1">
            {/* All */}
            <button
              onClick={() => setCategorie('')}
              className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                !categorie
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF3366] text-white shadow-lg shadow-[#FF6B35]/30 scale-105'
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-[#FF6B35]/40 hover:text-[#FF6B35]'
              }`}
            >
              <span>🍽️</span>
              Tous
            </button>
            {categories.map(cat => {
              const active = categorie === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategorie(cat.name)}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                    active
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-opacity-40 hover:scale-102'
                  }`}
                  style={active ? {
                    background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
                    boxShadow: `0 8px 25px ${cat.color}40`,
                  } : {}}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm group">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un plat…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#13131A] border border-gray-200 dark:border-white/8 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] p-1 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-[#13131A] border border-gray-200 dark:border-white/8 rounded-2xl text-sm text-gray-600 dark:text-gray-300 font-bold hover:border-[#FF6B35]/40 transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal size={15} />
              {sortOptions.find(o => o.value === sortBy)?.label || 'Trier'}
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/8 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/50 overflow-hidden z-20">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                        sortBy === opt.value
                          ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-400 dark:text-gray-500 font-semibold whitespace-nowrap self-center">
            <span className="text-gray-900 dark:text-white font-black">{filteredPlats.length}</span> résultat{filteredPlats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Section title ── */}
        {(categorie || searchTerm) && (
          <div className="flex items-center gap-3 mb-6">
            {activeCategory && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                style={{ background: activeCategory.bg }}>
                {activeCategory.emoji}
              </div>
            )}
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              {searchTerm ? `Résultats pour "${searchTerm}"` : categorie}
            </h2>
          </div>
        )}
        {!categorie && !searchTerm && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center">
              <Star size={14} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Tous nos plats</h2>
          </div>
        )}

        {/* ── Plats Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/6 rounded-3xl overflow-hidden h-[380px]">
                <div className="h-52 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-4 skeleton rounded-lg w-2/3" />
                  <div className="h-3 skeleton rounded-lg w-full" />
                  <div className="h-3 skeleton rounded-lg w-4/5" />
                  <div className="h-8 skeleton rounded-lg w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlats.length === 0 ? (
          <div className="text-center py-24 max-w-md mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6 text-5xl">
              🔍
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Aucun plat trouvé</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8 leading-relaxed font-medium">
              Essayez de modifier votre recherche ou vos filtres pour découvrir de délicieuses options
            </p>
            <button
              onClick={() => { setCategorie(''); setSearchTerm(''); }}
              className="gradient-btn px-6 py-3 rounded-2xl text-white font-bold text-sm cursor-pointer"
            >
              Voir tous les plats
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredPlats.map((plat, i) => (
              <PlatCard key={plat.id} plat={plat} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Cart Button ── */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 z-40 gradient-btn px-5 py-3.5 rounded-2xl flex items-center gap-3 cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag size={19} />
            <span className="absolute -top-2.5 -right-2.5 bg-white text-[#FF6B35] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FF6B35]">
              {cartCount}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-white/80 leading-none">Mon panier</span>
            <span className="text-sm font-black leading-tight">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cartTotal)}
            </span>
          </div>
        </button>
      )}

      {/* ── Cart Sidebar ── */}
      {showCart && <Panier onClose={() => setShowCart(false)} />}
    </div>
  );
}