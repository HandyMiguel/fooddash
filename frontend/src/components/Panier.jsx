// components/Panier.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag, MapPin, Clock } from 'lucide-react';

export default function Panier({ onClose }) {
  const { cart, updateQuantity, removeItem, clearCart, cartTotal } = useCart();
  const [adresse, setAdresse] = useState('');
  const navigate = useNavigate();

  const commander = async () => {
    if (!adresse.trim()) {
      toast.error('Veuillez renseigner une adresse de livraison');
      return;
    }
    
    try {
      const plats = cart.map(item => ({
        platId: item.id,
        quantite: item.quantite
      }));
      
      await api.post('/commandes', {
        plats,
        adresseLivraison: adresse
      });
      
      toast.success('Commande passée avec succès ! 🎉');
      clearCart();
      onClose();
      navigate('/commandes');
    } catch (error) {
      toast.error('Erreur lors de la commande');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-white/5 h-full overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-white/5 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  Panier
                </h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{cart.length} article(s)</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-gray-950 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">Votre panier est vide</p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md shadow-primary/10 hover:shadow-lg transition font-medium"
                >
                  Voir le menu
                </button>
              </div>
            ) : (
              cart.map(item => {
                const prix = item.promo > 0 ? item.prix * (1 - item.promo / 100) : item.prix;
                return (
                  <div key={item.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{item.nom}</h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition ml-2 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {item.promo > 0 && (
                          <span className="inline-block mt-1 text-[10px] bg-red-500/10 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                            -{item.promo}%
                          </span>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition text-gray-500 dark:text-gray-400"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-gray-900 dark:text-white font-bold w-6 text-center text-xs">{item.quantite}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition text-gray-500 dark:text-gray-400"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-primary dark:text-primary">
                            {(prix * item.quantite).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 p-6 space-y-4">
            {/* Delivery Address */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2 tracking-wide uppercase">
                <MapPin className="w-3.5 h-3.5" />
                Adresse de livraison
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="123 rue de Paris..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-primary transition"
              />
            </div>

            {/* Delivery Time */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              <span>Livraison estimée : 25-35 min</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total</span>
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {cartTotal.toFixed(2)}€
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={commander}
              disabled={!adresse}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 hover:translate-y-[-1px] active:translate-y-[0px] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              Commander • {cartTotal.toFixed(2)}€
            </button>
          </div>
        )}
      </div>
    </div>
  );
}