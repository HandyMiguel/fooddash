// components/ClientNavbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';
import Panier from './Panier';
import { useState } from 'react';
import {
  ShoppingBag, Heart, User,
  LogOut, Moon, Sun, Utensils, ClipboardList,
} from 'lucide-react';

const clientLinks = [
  { to: '/menu',      label: 'Menu',      icon: <Utensils size={15} /> },
  { to: '/commandes', label: 'Commandes', icon: <ClipboardList size={15} /> },
  { to: '/favoris',   label: 'Favoris',   icon: <Heart size={15} />, hasBadge: true },
  { to: '/profil',    label: 'Profil',    icon: <User size={15} /> },
];

export default function ClientNavbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { favorites } = useFavorites();
  const { cartCount } = useCart();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="fixed top-0 w-full z-50 glass shadow-sm transition-all duration-300">
        {/* Top gradient stripe */}
        <div className="h-[3px] bg-gradient-to-r from-transparent via-primary to-secondary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/menu" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-lg shadow-md shadow-primary/20 transform group-hover:scale-105 transition-transform duration-300">
              🍔
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
              FoodDash
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
            {clientLinks.map(({ to, label, icon, hasBadge }) => {
              const active = isActive(to);
              const badge = hasBadge ? favorites.length : 0;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                    active
                      ? 'bg-primary/10 border border-primary/25 text-primary'
                      : 'border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {icon}
                  {label}
                  {badge > 0 && (
                    <span className="bg-secondary text-white text-[10px] font-extrabold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-pulse">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions - toujours visibles, même sur mobile */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all duration-300"
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-primary to-secondary text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950 shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-all duration-300"
            >
              {dark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Avatar */}
            <Link
              to="/profil"
              className="hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary items-center justify-center text-white font-extrabold text-xs shadow-md shadow-primary/10 hover:scale-105 transition-transform duration-300"
            >
              {user?.nom?.[0]?.toUpperCase() || 'U'}
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              title="Déconnexion"
              className="w-9 h-9 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-all duration-300"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* BOTTOM TAB BAR - mobile uniquement avec fond noir */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-4">
          {clientLinks.map(({ to, label, icon, hasBadge }) => {
            const active = isActive(to);
            const badge = hasBadge ? favorites.length : 0;
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-300"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-400'
                }`}>
                  {icon}
                  {badge > 0 && (
                    <span className="absolute top-1 right-[22%] bg-secondary text-white text-[9px] font-extrabold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                  active ? 'text-primary' : 'text-gray-400'
                }`}>
                  {label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-gradient-to-r from-primary to-secondary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {cartOpen && (
        <Panier onClose={() => setCartOpen(false)} />
      )}
    </>
  );
}