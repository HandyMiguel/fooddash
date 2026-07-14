'use strict';

const {
  AnneeUniversitaire, SessionExamen, Enseignant, sequelize,
} = require('../models');

// ─── ANNEE UNIVERSITAIRE ──────────────────────────────────────────────────────

exports.getAllAnnees = async (req, res) => {
  try {
    const annees = await AnneeUniversitaire.findAll({ order: [['annee_debut', 'DESC']] });
    return res.status(200).json(annees);
  } catch (err) { return res.status(500).json({ message: err.message }); }
};

exports.getAnneeById = async (req, res) => {
  try {
    const annee = await AnneeUniversitaire.findByPk(req.params.id);
    if (!annee) return res.status(404).json({ message: 'Année universitaire introuvable.' });
    return res.status(200).json(annee);
  } catch (err) { return res.status(500).json({ message: err.message }); }
};

exports.createAnnee = async (req, res) => {
  try {
    const { libelle, annee_debut, annee_fin, en_cours } = req.body;
    // S'assurer qu'une seule année est en_cours = true
    if (en_cours) await AnneeUniversitaire.update({ en_cours: false }, { where: {} });
    const annee = await AnneeUniversitaire.create({ libelle, annee_debut, annee_fin, en_cours: en_cours || false });
    return res.status(201).json(annee);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.updateAnnee = async (req, res) => {
  try {
    const annee = await AnneeUniversitaire.findByPk(req.params.id);
    if (!annee) return res.status(404).json({ message: 'Année universitaire introuvable.' });
    const { libelle, annee_debut, annee_fin, en_cours } = req.body;
    if (en_cours) await AnneeUniversitaire.update({ en_cours: false }, { where: {} });
    await annee.update({ libelle, annee_debut, annee_fin, en_cours });
    return res.status(200).json(annee);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteAnnee = async (req, res) => {
  try {
    const annee = await AnneeUniversitaire.findByPk(req.params.id);
    if (!annee) return res.status(404).json({ message: 'Année universitaire introuvable.' });
    await annee.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des inscriptions ou sessions sont liées à cette année.' });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ─── SESSION EXAMEN ───────────────────────────────────────────────────────────

exports.getAllSessions = async (req, res) => {
  try {
    const { annee_universitaire_id } = req.query;
    const where = annee_universitaire_id ? { annee_universitaire_id } : {};
    const sessions = await SessionExamen.findAll({
      where,
      include: [{ association: 'anneeUniversitaire', attributes: ['id', 'libelle'] }],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json(sessions);
  } catch (err) { return res.status(500).json({ message: err.message }); }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await SessionExamen.findByPk(req.params.id, {
      include: [{ association: 'anneeUniversitaire' }],
    });
    if (!session) return res.status(404).json({ message: 'Session d\'examen introuvable.' });
    return res.status(200).json(session);
  } catch (err) { return res.status(500).json({ message: err.message }); }
};

exports.createSession = async (req, res) => {
  try {
    const { libelle, type_session, date_debut, date_fin, annee_universitaire_id } = req.body;
    const session = await SessionExamen.create({
      libelle, type_session, date_debut: date_debut || null, date_fin: date_fin || null, annee_universitaire_id,
    });
    return res.status(201).json(session);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await SessionExamen.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session d\'examen introuvable.' });
    const { libelle, type_session, date_debut, date_fin, annee_universitaire_id } = req.body;
    await session.update({
      libelle, type_session, date_debut: date_debut || null, date_fin: date_fin || null, annee_universitaire_id,
    });
    return res.status(200).json(session);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await SessionExamen.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session d\'examen introuvable.' });
    await session.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des notes sont liées à cette session.' });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ─── ENSEIGNANT ───────────────────────────────────────────────────────────────

exports.getAllEnseignants = async (req, res) => {
  try {
    const { actif, grade } = req.query;
    const where = {};
    if (actif !== undefined) where.actif = actif === 'true';
    if (grade) where.grade = grade;
    const enseignants = await Enseignant.findAll({ where, order: [['nom', 'ASC'], ['prenom', 'ASC']] });
    return res.status(200).json(enseignants);
  } catch (err) { return res.status(500).json({ message: err.message }); }
};

exports.getEnseignantById = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.id);
    if (!enseignant) return res.status(404).json({ message: 'Enseignant introuvable.' });
    return res.status(200).json(enseignant);
  } catch (err) { return res.status(500).json({ message: err.message }); }
};

exports.createEnseignant = async (req, res) => {
  try {
    const { matricule, nom, prenom, email, telephone, grade, specialite, actif } = req.body;
    const enseignant = await Enseignant.create({ matricule, nom, prenom, email, telephone, grade, specialite, actif });
    return res.status(201).json(enseignant);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.updateEnseignant = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.id);
    if (!enseignant) return res.status(404).json({ message: 'Enseignant introuvable.' });
    const { matricule, nom, prenom, email, telephone, grade, specialite, actif } = req.body;
    await enseignant.update({ matricule, nom, prenom, email, telephone, grade, specialite, actif });
    return res.status(200).json(enseignant);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteEnseignant = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.id);
    if (!enseignant) return res.status(404).json({ message: 'Enseignant introuvable.' });
    await enseignant.destroy();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Impossible de supprimer : des notes sont liées à cet enseignant.' });
    }
    return res.status(500).json({ message: err.message });
  }
};
