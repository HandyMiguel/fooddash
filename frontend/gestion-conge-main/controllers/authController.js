'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'gestnotes_secret_key_2024_very_secure';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const user = await User.create({ nom, prenom, email, password });
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ message: err.message });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.actif) {
      return res.status(403).json({ message: 'Votre compte est désactivé. Contactez l\'administrateur.' });
    }

    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    return res.status(200).json(user.toJSON());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
