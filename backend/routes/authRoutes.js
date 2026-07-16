import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

router.put('/profile', auth, updateProfile);        // ← Mise à jour profil
router.put('/change-password', auth, changePassword); // ← Changement mot de passe
router.delete('/account', auth, deleteAccount);

export default router;