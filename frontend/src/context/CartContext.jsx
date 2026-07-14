import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('fooddash_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('fooddash_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (plat) => {
    if (!plat || !plat.id) return;
    setCart((prev) => {
      const exists = prev.find((item) => item.id === plat.id);
      if (exists) {
        return prev.map((item) =>
          item.id === plat.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, { ...plat, quantite: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantite + delta;
            return newQty > 0 ? { ...item, quantite: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantite > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantite || 0), 0);

  const cartTotal = cart.reduce((sum, item) => {
    const prix = item.promo > 0 ? item.prix * (1 - item.promo / 100) : item.prix;
    return sum + prix * (item.quantite || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
