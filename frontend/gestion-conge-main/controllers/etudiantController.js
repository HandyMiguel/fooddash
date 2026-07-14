'use strict';

const { Etudiant, Parcours, Niveau, Note, Matiere } = require('../models');

// GET /etudiants
exports.getAll = async (req, res) => {
  try {
    const { parcours_id, niveau_id, actif } = req.query;
    const where = {};
    if (parcours_id) where.parcours_id = parcours_id;
    if (niveau_id) where.niveau_id = niveau_id;
    if (actif !== undefined) where.actif = actif === 'true';

    const etudiants = await Etudiant.findAll({
      where,
      include: [
        { association: 'parcours', include: [{ association: 'mention' }] },
        { association: 'niveau' },
      ],
      order: [['nom', 'ASC'], ['prenom', 'ASC']],
    });
    return res.status(200).json(etudiants);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /etudiants/:id
exports.getById = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByPk(req.params.id, {
      include: [
        { association: 'parcours', include: [{ association: 'mention' }] },
        { association: 'niveau' },
      ],
    });
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable.' });
    return res.status(200).json(etudiant);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /etudiants/:id/notes
exports.getNotes = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByPk(req.params.id);
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable.' });

    const notes = await Note.findAll({
      where: { etudiant_id: req.params.id },
      include: [
        { association: 'matiere', include: [{ association: 'module' }] },
        { association: 'anneeUniversitaire' },
        { association: 'session' },
        { association: 'enseignant', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /etudiants
exports.create = async (req, res) => {
  try {
    const {
      numero_etudiant, nom, prenom, date_naissance, lieu_naissance,
      genre, email, telephone, parcours_id, niveau_id, actif,
    } = req.body;

    const etudiant = await Etudiant.create({
      numero_etudiant, nom, prenom, date_naissance, lieu_naissance,
      genre, email, telephone, parcours_id, niveau_id,
      actif: actif !== undefined ? actif : true,
    });
    return res.status(201).json(etudiant);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /etudiants/:id
exports.update = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByPk(req.params.id);
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable.' });

    const {
      numero_etudiant, nom, prenom, date_naissance, lieu_naissance,
      genre, email, telephone, parcours_id, niveau_id, actif,
    } = req.body;

    await etudiant.update({
      numero_etudiant, nom, prenom, date_naissance, lieu_naissance,
      genre, email, telephone, parcours_id, niveau_id, actif,
    });
    return res.status(200).json(etudiant);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /etudiants/:id/actif
exports.toggleActif = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByPk(req.params.id);
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable.' });
    await etudiant.update({ actif: !etudiant.actif });
    return res.status(200).json({ message: `Étudiant ${etudiant.actif ? 'activé' : 'désactivé'}.`, etudiant });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /etudiants/:id
exports.remove = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByPk(req.params.id);
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable.' });
    await etudiant.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des notes ou inscriptions sont liées à cet étudiant.' });
    }
    return res.status(500).json({ message: err.message });
  }
};
