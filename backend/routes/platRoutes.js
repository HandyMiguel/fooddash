// routes/plats.js
import express from 'express';
import { 
  getAllPlats, 
  getPlatById, 
  createPlat, 
  updatePlat, 
  deletePlat,
  uploadPlatImage,
  deletePlatImage 
} from '../controllers/platController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuration upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'plat-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Routes CRUD
router.get('/', getAllPlats);
router.get('/:id', getPlatById);
router.post('/', createPlat);
router.put('/:id', updatePlat);
router.delete('/:id', deletePlat);

// Route upload image
router.post('/:id/upload', upload.single('image'), uploadPlatImage);
router.delete('/:id/image', deletePlatImage);

export default router;