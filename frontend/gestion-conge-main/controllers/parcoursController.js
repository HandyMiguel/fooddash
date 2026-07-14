'use strict';

const { Parcours, Mention, Module, Etudiant } = require('../models');

// GET /parcours
exports.getAll = async (req, res) => {
  try {
    const parcours = await Parcours.findAll({
      include: [{ association: 'mention', attributes: ['id', 'libelle'] }],
      order: [['libelle', 'ASC']],
    });
    return res.status(200).json(parcours);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /parcours/:id
exports.getById = async (req, res) => {
  try {
    const parcours = await Parcours.findByPk(req.params.id, {
      include: [
        { association: 'mention' },
        { association: 'modules', include: [{ association: 'niveau' }] },
      ],
    });
    if (!parcours) return res.status(404).json({ message: 'Parcours introuvable.' });
    return res.status(200).json(parcours);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /parcours
exports.create = async (req, res) => {
  try {
    const { libelle, description, mention_id } = req.body;
    const parcours = await Parcours.create({ libelle, description, mention_id });
    return res.status(201).json(parcours);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /parcours/:id
exports.update = async (req, res) => {
  try {
    const parcours = await Parcours.findByPk(req.params.id);
    if (!parcours) return res.status(404).json({ message: 'Parcours introuvable.' });
    const { libelle, description, mention_id } = req.body;
    await parcours.update({ libelle, description, mention_id });
    return res.status(200).json(parcours);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /parcours/:id
exports.remove = async (req, res) => {
  try {
    const parcours = await Parcours.findByPk(req.params.id);
    if (!parcours) return res.status(404).json({ message: 'Parcours introuvable.' });
    await parcours.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des étudiants ou modules sont liés à ce parcours.' });
    }
    return res.status(500).json({ message: err.message });
  }
};
