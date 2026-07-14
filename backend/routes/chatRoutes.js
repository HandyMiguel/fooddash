import express from 'express';
import { getHistory, getRooms, getOrCreateRoom, closeRoom, markRead } from '../controllers/chatController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/room',                verifyToken,          getOrCreateRoom);
router.get('/history/:roomId',      verifyToken,          getHistory);
router.get('/rooms',                verifyToken, isAdmin,  getRooms);
router.put('/room/:roomId/close',   verifyToken, isAdmin,  closeRoom);
router.put('/room/:roomId/read',    verifyToken, isAdmin,  markRead);

export default router;