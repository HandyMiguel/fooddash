import express from 'express';
import { getUserNotifications, marquerLue, sendNotificationToAll } from '../controllers/notificationController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getUserNotifications);
router.put('/:id/lu', auth, marquerLue);
router.post('/broadcast', auth, adminAuth, sendNotificationToAll);

export default router;