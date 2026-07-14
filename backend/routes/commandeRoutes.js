import express from 'express';
import { 
  createCommande, 
  getUserCommandes, 
  getAllCommandes, 
  updateStatutCommande,
  getCommandesDisponibles,
  getLivreurCommandes,
  accepterLivraison,
  marquerLivree
} from '../controllers/commandeController.js';
import { auth, adminAuth, livreurAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createCommande);
router.get('/mes-commandes', auth, getUserCommandes);
router.get('/all', auth, adminAuth, getAllCommandes);
router.put('/:id/statut', auth, adminAuth, updateStatutCommande);

// Routes pour le livreur
router.get('/livreur/disponibles', livreurAuth, getCommandesDisponibles);
router.get('/livreur/mes-livraisons', livreurAuth, getLivreurCommandes);
router.put('/:id/accepter', livreurAuth, accepterLivraison);
router.put('/:id/livrer', livreurAuth, marquerLivree);

export default router;