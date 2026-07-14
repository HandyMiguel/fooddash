// routes/settings.js
import express from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settingController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/reset', resetSettings);

export default router;