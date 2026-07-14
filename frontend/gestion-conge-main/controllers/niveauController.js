'use strict';

const { Niveau } = require('../models');

// GET /niveaux
exports.getAll = async (req, res) => {
  try {
    const niveaux = await Niveau.findAll({ order: [['ordre', 'ASC']] });
    return res.status(200).json(niveaux);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /niveaux/:id
exports.getById = async (req, res) => {
  try {
    const niveau = await Niveau.findByPk(req.params.id);
    if (!niveau) return res.status(404).json({ message: 'Niveau introuvable.' });
    return res.status(200).json(niveau);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /niveaux
exports.create = async (req, res) => {
  try {
    const { libelle, ordre } = req.body;
    const niveau = await Niveau.create({ libelle, ordre });
    return res.status(201).json(niveau);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /niveaux/:id
exports.update = async (req, res) => {
  try {
    const niveau = await Niveau.findByPk(req.params.id);
    if (!niveau) return res.status(404).json({ message: 'Niveau introuvable.' });
    const { libelle, ordre } = req.body;
    await niveau.update({ libelle, ordre });
    return res.status(200).json(niveau);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /niveaux/:id
exports.remove = async (req, res) => {
  try {
    const niveau = await Niveau.findByPk(req.params.id);
    if (!niveau) return res.status(404).json({ message: 'Niveau introuvable.' });
    await niveau.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des modules ou étudiants sont liés à ce niveau.' });
    }
    return res.status(500).json({ message: err.message });
  }
};
