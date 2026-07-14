// controllers/favorisController.js
import Favori from '../models/Favori.js';
import Plat from '../models/Plat.js';

// Obtenir tous les favoris d'un utilisateur
export const getFavoris = async (req, res) => {
  try {
    const favoris = await Favori.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Plat,
          attributes: ['id', 'nom', 'description', 'prix', 'categorie', 'image', 'promo', 'disponible']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format simplifié : retourne juste la liste des IDs de plats
    const platIds = favoris.map(f => f.platId);
    
    // Ou format complet avec les infos des plats
    const platsFavoris = favoris.map(f => ({
      id: f.id,
      platId: f.platId,
      plat: f.Plat,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }));

    res.json({
      favoris: platsFavoris,
      platIds: platIds
    });
  } catch (error) {
    console.error('Erreur getFavoris:', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter un plat aux favoris
export const addFavori = async (req, res) => {
  try {
    const { platId } = req.body;

    // Vérifier que le plat existe
    const plat = await Plat.findByPk(platId);
    if (!plat) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }

    // Vérifier si déjà en favori
    const existe = await Favori.findOne({
      where: {
        userId: req.user.id,
        platId
      }
    });

    if (existe) {
      return res.status(400).json({ message: 'Ce plat est déjà dans vos favoris' });
    }

    // Créer le favori
    const favori = await Favori.create({
      userId: req.user.id,
      platId
    });

    // Récupérer le favori avec les infos du plat
    const favoriComplet = await Favori.findByPk(favori.id, {
      include: [{ model: Plat }]
    });

    res.status(201).json({
      message: 'Plat ajouté aux favoris',
      favori: favoriComplet
    });
  } catch (error) {
    console.error('Erreur addFavori:', error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un plat des favoris
export const removeFavori = async (req, res) => {
  try {
    const { platId } = req.params;

    const favori = await Favori.findOne({
      where: {
        userId: req.user.id,
        platId
      }
    });

    if (!favori) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }

    await favori.destroy();

    res.json({
      message: 'Plat retiré des favoris',
      platId: parseInt(platId)
    });
  } catch (error) {
    console.error('Erreur removeFavori:', error);
    res.status(500).json({ error: error.message });
  }
};

// Vérifier si un plat est en favori
export const checkFavori = async (req, res) => {
  try {
    const { platId } = req.params;

    const favori = await Favori.findOne({
      where: {
        userId: req.user.id,
        platId
      }
    });

    res.json({
      isFavorite: !!favori,
      favoriId: favori ? favori.id : null
    });
  } catch (error) {
    console.error('Erreur checkFavori:', error);
    res.status(500).json({ error: error.message });
  }
};