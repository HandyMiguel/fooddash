import express from 'express';
import { register, login, getProfile ,updateProfile , changePassword , deleteAccount} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

router.put('/profile', auth, updateProfile);        // ← Mise à jour profil
router.put('/change-password', auth, changePassword); // ← Changement mot de passe
router.delete('/account', auth, deleteAccount); 
// Route temporaire - À SUPPRIMER après utilisation !
router.post('/create-admin', async (req, res) => {
  try {
    const admin = await User.create({
      nom: 'Admin',
      email: 'admin@fooddash.com',
      password: 'Admin123!',
      role: 'admin',
      telephone: '0000000000'
    });
    
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Admin créé !',
      credentials: {
        email: 'admin@fooddash.com',
        password: 'Admin123!'
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
export default router;