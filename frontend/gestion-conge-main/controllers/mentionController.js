'use strict';

const { Mention, Parcours } = require('../models');

// GET /mentions
exports.getAll = async (req, res) => {
  try {
    const mentions = await Mention.findAll({
      include: [{ association: 'parcours', attributes: ['id', 'libelle'] }],
      order: [['libelle', 'ASC']],
    });
    return res.status(200).json(mentions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /mentions/:id
exports.getById = async (req, res) => {
  try {
    const mention = await Mention.findByPk(req.params.id, {
      include: [{ association: 'parcours' }],
    });
    if (!mention) return res.status(404).json({ message: 'Mention introuvable.' });
    return res.status(200).json(mention);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /mentions
exports.create = async (req, res) => {
  try {
    const { libelle, description } = req.body;
    const mention = await Mention.create({ libelle, description });
    return res.status(201).json(mention);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /mentions/:id
exports.update = async (req, res) => {
  try {
    const mention = await Mention.findByPk(req.params.id);
    if (!mention) return res.status(404).json({ message: 'Mention introuvable.' });
    const { libelle, description } = req.body;
    await mention.update({ libelle, description });
    return res.status(200).json(mention);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /mentions/:id
exports.remove = async (req, res) => {
  try {
    const mention = await Mention.findByPk(req.params.id);
    if (!mention) return res.status(404).json({ message: 'Mention introuvable.' });
    await mention.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des parcours sont liés à cette mention.' });
    }
    return res.status(500).json({ message: err.message });
  }
};
