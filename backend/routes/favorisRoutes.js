// routes/favorisRoutes.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  getFavoris, 
  addFavori, 
  removeFavori, 
  checkFavori 
} from '../controllers/favorisController.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(auth);

// GET /api/favoris - Récupérer tous les favoris
router.get('/', getFavoris);

// POST /api/favoris - Ajouter un favori
router.post('/', addFavori);

// DELETE /api/favoris/:platId - Supprimer un favori
router.delete('/:platId', removeFavori);

// GET /api/favoris/check/:platId - Vérifier si un plat est en favori
router.get('/check/:platId', checkFavori);

export default router;