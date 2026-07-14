// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Favori from '../models/Favori.js';

export const register = async (req, res) => {
  try {
    const { nom, email, password, telephone, adresse, role, vehicule } = req.body;

    const userExiste = await User.findOne({ where: { email } });
    if (userExiste) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // ✅ PAS de bcrypt.hash ici — le hook beforeCreate du modèle s'en charge
    const user = await User.create({
      nom,
      email,
      password, // brut → haché une seule fois par le hook
      telephone,
      adresse,
      role: role || 'user',
      vehicule: role === 'livreur' ? (vehicule || 'Vélo') : null,
      disponible: role === 'livreur' ? false : null
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id:        user.id,
        nom:       user.nom,
        email:     user.email,
        role:      user.role,
        telephone: user.telephone,
        adresse:   user.adresse,
        vehicule:  user.vehicule,
        disponible: user.disponible,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // ✅ validatePassword() définie dans le modèle User
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id:        user.id,
        nom:       user.nom,
        email:     user.email,
        role:      user.role,
        telephone: user.telephone,
        adresse:   user.adresse,
        vehicule:  user.vehicule,
        disponible: user.disponible,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  const userData = req.user.toJSON();
  delete userData.password;
  res.json(userData);
};

export const updateProfile = async (req, res) => {
  try {
    const { nom, email, telephone, adresse, vehicule, disponible } = req.body;
    const userId = req.user.id;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existingUser) {
        return res.status(400).json({
          message: 'Cet email est déjà utilisé par un autre compte',
        });
      }
    }

    const updateData = {};
    if (nom       !== undefined) updateData.nom       = nom;
    if (email     !== undefined) updateData.email     = email;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (adresse   !== undefined) updateData.adresse   = adresse;
    if (vehicule   !== undefined) updateData.vehicule   = vehicule;
    if (disponible !== undefined) updateData.disponible = disponible;

    await User.update(updateData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    res.json({ message: 'Profil mis à jour avec succès', user: updatedUser });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour',
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    const user = await User.findByPk(userId);

    // ✅ validatePassword() pour vérifier l'ancien mot de passe
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // ✅ Hash manuel ici car il n'y a pas de hook beforeUpdate dans le modèle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id: userId } });

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await Favori.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteAccount:', error);
    res.status(500).json({ error: error.message });
  }
};