// context/FavoritesContext.jsx - Version finale avec API
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Charger les favoris depuis l'API
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get('/favoris');
      const platIds = res.data.platIds || [];
      setFavorites(platIds);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      // En cas d'erreur, on garde l'état actuel
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Ajouter/Retirer un favori
  const toggleFavorite = async (platId) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter des favoris');
      return false;
    }

    try {
      const isFav = favorites.includes(platId);
      
      if (isFav) {
        // Retirer des favoris
        await api.delete(`/favoris/${platId}`);
        setFavorites(prev => prev.filter(id => id !== platId));
        toast.success('Retiré des favoris');
        return false;
      } else {
        // Ajouter aux favoris
        await api.post('/favoris', { platId });
        setFavorites(prev => [...prev, platId]);
        toast.success('Ajouté aux favoris ! ❤️');
        return true;
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
      return null;
    }
  };

  // Vérifier si un plat est dans les favoris
  const isFavorite = useCallback((platId) => {
    if (!platId) return false;
    return favorites.includes(platId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      favoritesCount: favorites.length,
      toggleFavorite, 
      isFavorite,
      loading,
      loadFavorites 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};