import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentification requise' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

export const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });
    next();
  });
};

export const livreurAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user.role !== 'livreur') return res.status(403).json({ message: 'Accès livreur requis' });
    next();
  });
};

export const verifyToken = auth;

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
  next();
};