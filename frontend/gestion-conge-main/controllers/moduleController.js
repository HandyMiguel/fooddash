'use strict';

const { Module, Matiere, Parcours, Niveau } = require('../models');

// ─── MODULE ───────────────────────────────────────────────────────────────────

// GET /modules
exports.getAllModules = async (req, res) => {
  try {
    const { parcours_id, niveau_id, semestre } = req.query;
    const where = {};
    if (parcours_id) where.parcours_id = parcours_id;
    if (niveau_id) where.niveau_id = niveau_id;
    if (semestre) where.semestre = semestre;

    const modules = await Module.findAll({
      where,
      include: [
        { association: 'parcours', include: [{ association: 'mention' }] },
        { association: 'niveau' },
        { association: 'matieres' },
      ],
      order: [['semestre', 'ASC'], ['libelle', 'ASC']],
    });
    return res.status(200).json(modules);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /modules/:id
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [
        { association: 'parcours', include: [{ association: 'mention' }] },
        { association: 'niveau' },
        { association: 'matieres' },
      ],
    });
    if (!module) return res.status(404).json({ message: 'Module introuvable.' });
    return res.status(200).json(module);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /modules
exports.createModule = async (req, res) => {
  try {
    const { code, libelle, credits, semestre, parcours_id, niveau_id } = req.body;
    const module = await Module.create({ code, libelle, credits, semestre, parcours_id, niveau_id });
    return res.status(201).json(module);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /modules/:id
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module introuvable.' });
    const { code, libelle, credits, semestre, parcours_id, niveau_id } = req.body;
    await module.update({ code, libelle, credits, semestre, parcours_id, niveau_id });
    return res.status(200).json(module);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /modules/:id
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module introuvable.' });
    await module.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des matières sont liées à ce module.' });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ─── MATIERE ──────────────────────────────────────────────────────────────────

// GET /matieres
exports.getAllMatieres = async (req, res) => {
  try {
    const { module_id, type_matiere } = req.query;
    const where = {};
    if (module_id) where.module_id = module_id;
    if (type_matiere) where.type_matiere = type_matiere;

    const matieres = await Matiere.findAll({
      where,
      include: [{ association: 'module', include: [{ association: 'parcours' }, { association: 'niveau' }] }],
      order: [['libelle', 'ASC']],
    });
    return res.status(200).json(matieres);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /matieres/:id
exports.getMatiereById = async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id, {
      include: [{ association: 'module', include: [{ association: 'parcours' }, { association: 'niveau' }] }],
    });
    if (!matiere) return res.status(404).json({ message: 'Matière introuvable.' });
    return res.status(200).json(matiere);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /matieres
exports.createMatiere = async (req, res) => {
  try {
    const { code, libelle, coefficient, volume_horaire, type_matiere, module_id } = req.body;
    const matiere = await Matiere.create({ code, libelle, coefficient, volume_horaire, type_matiere, module_id });
    return res.status(201).json(matiere);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /matieres/:id
exports.updateMatiere = async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: 'Matière introuvable.' });
    const { code, libelle, coefficient, volume_horaire, type_matiere, module_id } = req.body;
    await matiere.update({ code, libelle, coefficient, volume_horaire, type_matiere, module_id });
    return res.status(200).json(matiere);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /matieres/:id
exports.deleteMatiere = async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: 'Matière introuvable.' });
    await matiere.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des notes sont liées à cette matière.' });
    }
    return res.status(500).json({ message: err.message });
  }
};
