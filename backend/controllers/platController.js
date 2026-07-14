// controllers/platController.js
import Plat from '../models/Plat.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET - Tous les plats
export const getAllPlats = async (req, res) => {
  try {
    const { categorie, search, disponible } = req.query;
    const where = {};

    if (categorie) where.categorie = categorie;
    if (disponible !== undefined) where.disponible = disponible === 'true';
    if (search) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const plats = await Plat.findAll({ 
      where, 
      order: [['categorie', 'ASC'], ['nom', 'ASC']] 
    });
    res.json(plats);
  } catch (error) {
    console.error('Erreur getAllPlats:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET - Un plat par ID
export const getPlatById = async (req, res) => {
  try {
    const plat = await Plat.findByPk(req.params.id);
    if (!plat) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }
    res.json(plat);
  } catch (error) {
    console.error('Erreur getPlatById:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST - Créer un plat
export const createPlat = async (req, res) => {
  try {
    const { nom, description, prix, categorie, image, promo, disponible } = req.body;

    // Validation
    if (!nom || !prix || !categorie) {
      return res.status(400).json({ message: 'Nom, prix et catégorie sont requis' });
    }

    const plat = await Plat.create({
      nom,
      description: description || '',
      prix: parseFloat(prix),
      categorie,
      image: image || 'default-food.jpg',
      promo: parseInt(promo) || 0,
      disponible: disponible !== undefined ? disponible : true
    });

    res.status(201).json(plat);
  } catch (error) {
    console.error('Erreur createPlat:', error);
    res.status(400).json({ error: error.message });
  }
};

// PUT - Mettre à jour un plat
export const updatePlat = async (req, res) => {
  try {
    const plat = await Plat.findByPk(req.params.id);
    if (!plat) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }

    const { nom, description, prix, categorie, image, promo, disponible } = req.body;

    // Si une nouvelle image est uploadée et que l'ancienne existe, supprimer l'ancienne
    if (image && plat.image && plat.image !== 'default-food.jpg' && plat.image !== image) {
      const oldImagePath = path.join(__dirname, '..', 'public', plat.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await plat.update({
      nom: nom || plat.nom,
      description: description !== undefined ? description : plat.description,
      prix: prix ? parseFloat(prix) : plat.prix,
      categorie: categorie || plat.categorie,
      image: image !== undefined ? image : plat.image,
      promo: promo !== undefined ? parseInt(promo) : plat.promo,
      disponible: disponible !== undefined ? disponible : plat.disponible
    });

    res.json(plat);
  } catch (error) {
    console.error('Erreur updatePlat:', error);
    res.status(400).json({ error: error.message });
  }
};

// DELETE - Supprimer un plat
export const deletePlat = async (req, res) => {
  try {
    const plat = await Plat.findByPk(req.params.id);
    if (!plat) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }

    // Supprimer l'image associée si elle existe
    if (plat.image && plat.image !== 'default-food.jpg') {
      const imagePath = path.join(__dirname, '..', 'public', plat.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await plat.destroy();
    res.json({ message: 'Plat supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deletePlat:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST - Upload d'image pour un plat
export const uploadPlatImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      url: imageUrl, 
      message: 'Image uploadée avec succès',
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Erreur uploadPlatImage:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE - Supprimer l'image d'un plat
export const deletePlatImage = async (req, res) => {
  try {
    const plat = await Plat.findByPk(req.params.id);
    if (!plat) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }

    if (plat.image && plat.image !== 'default-food.jpg') {
      const imagePath = path.join(__dirname, '..', 'public', plat.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await plat.update({ image: 'default-food.jpg' });
    res.json({ message: 'Image supprimée', plat });
  } catch (error) {
    console.error('Erreur deletePlatImage:', error);
    res.status(500).json({ error: error.message });
  }
};