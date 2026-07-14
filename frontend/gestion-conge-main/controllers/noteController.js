'use strict';

const { Note, Etudiant, Matiere, AnneeUniversitaire, SessionExamen, Enseignant, Module } = require('../models');
const { Op } = require('sequelize');

// GET /notes
exports.getAll = async (req, res) => {
  try {
    const { etudiant_id, matiere_id, session_examen_id, annee_universitaire_id } = req.query;
    const where = {};
    if (etudiant_id) where.etudiant_id = etudiant_id;
    if (matiere_id) where.matiere_id = matiere_id;
    if (session_examen_id) where.session_examen_id = session_examen_id;
    if (annee_universitaire_id) where.annee_universitaire_id = annee_universitaire_id;

    const notes = await Note.findAll({
      where,
      include: [
        { association: 'etudiant', attributes: ['id', 'numero_etudiant', 'nom', 'prenom'] },
        { association: 'matiere', include: [{ association: 'module' }] },
        { association: 'anneeUniversitaire', attributes: ['id', 'libelle'] },
        { association: 'session', attributes: ['id', 'libelle', 'type_session'] },
        { association: 'enseignant', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /notes/:id
exports.getById = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id, {
      include: [
        { association: 'etudiant' },
        { association: 'matiere', include: [{ association: 'module' }] },
        { association: 'anneeUniversitaire' },
        { association: 'session' },
        { association: 'enseignant' },
      ],
    });
    if (!note) return res.status(404).json({ message: 'Note introuvable.' });
    return res.status(200).json(note);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /notes
exports.create = async (req, res) => {
  try {
    const { valeur, observation, etudiant_id, matiere_id, annee_universitaire_id, session_examen_id, enseignant_id } = req.body;
    const note = await Note.create({
      valeur, observation, etudiant_id, matiere_id,
      annee_universitaire_id, session_examen_id, enseignant_id,
    });
    return res.status(201).json(note);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Une note existe déjà pour cet étudiant dans cette matière et cette session.' });
    }
    return res.status(500).json({ message: err.message });
  }
};

// PUT /notes/:id
exports.update = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note introuvable.' });
    const { valeur, observation, etudiant_id, matiere_id, annee_universitaire_id, session_examen_id, enseignant_id } = req.body;
    await note.update({ valeur, observation, etudiant_id, matiere_id, annee_universitaire_id, session_examen_id, enseignant_id });
    return res.status(200).json(note);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /notes/:id
exports.remove = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note introuvable.' });
    await note.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /notes/releve/:etudiant_id — relevé de notes complet structuré par module
exports.releve = async (req, res) => {
  try {
    const { etudiant_id } = req.params;
    const { annee_universitaire_id } = req.query;

    const etudiant = await Etudiant.findByPk(etudiant_id, {
      include: [
        { association: 'parcours', include: [{ association: 'mention' }] },
        { association: 'niveau' },
      ],
    });
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable.' });

    const where = { etudiant_id };
    if (annee_universitaire_id) where.annee_universitaire_id = annee_universitaire_id;

    const notes = await Note.findAll({
      where,
      include: [
        { association: 'matiere', include: [{ association: 'module' }] },
        { association: 'anneeUniversitaire' },
        { association: 'session' },
      ],
    });

    // ── Grouper les notes par module ──────────────────────────────────────────
    const moduleMap = {};
    notes.forEach(n => {
      const mod = n.matiere?.module;
      if (!mod) return;

      const moduleKey = mod.id;
      if (!moduleMap[moduleKey]) {
        moduleMap[moduleKey] = {
          code: mod.code,
          libelle: mod.libelle,
          semestre: mod.semestre,
          credits: mod.credits,
          matieres: [],
        };
      }

      moduleMap[moduleKey].matieres.push({
        matiere: n.matiere.libelle,
        code: n.matiere.code,
        coefficient: parseFloat(n.matiere.coefficient || 1),
        note: parseFloat(n.valeur).toFixed(2),
      });
    });

    // ── Calculer moyenne par module ──────────────────────────────────────────
    const modules = Object.values(moduleMap).map(mod => {
      let totalPondere = 0;
      let totalCoef = 0;
      mod.matieres.forEach(mat => {
        totalPondere += parseFloat(mat.note) * mat.coefficient;
        totalCoef += mat.coefficient;
      });
      mod.moyenne_module = totalCoef > 0 ? (totalPondere / totalCoef).toFixed(2) : '0.00';
      return mod;
    });

    // ── Moyenne générale pondérée par crédits ────────────────────────────────
    let totalCreditsValides = 0;
    let sommeCredits = 0;
    let sommePoints = 0;

    modules.forEach(mod => {
      const moy = parseFloat(mod.moyenne_module);
      const cred = parseInt(mod.credits) || 0;
      sommePoints += moy * cred;
      sommeCredits += cred;
      if (moy >= 10) totalCreditsValides += cred;
    });

    const moyenneGenerale = sommeCredits > 0 ? (sommePoints / sommeCredits).toFixed(2) : '0.00';

    // ── Mention générale ─────────────────────────────────────────────────────
    const moy = parseFloat(moyenneGenerale);
    let mentionGenerale = 'Insuffisant';
    if (moy >= 16) mentionGenerale = 'Très Bien';
    else if (moy >= 14) mentionGenerale = 'Bien';
    else if (moy >= 12) mentionGenerale = 'Assez Bien';
    else if (moy >= 10) mentionGenerale = 'Passable';

    return res.status(200).json({
      etudiant: {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        numero_etudiant: etudiant.numero_etudiant,
        niveau: etudiant.niveau?.libelle || 'N/A',
        parcours: etudiant.parcours?.libelle || 'N/A',
        mention: etudiant.parcours?.mention?.libelle || 'N/A',
      },
      modules,
      moyenne_generale: moyenneGenerale,
      mention_generale: mentionGenerale,
      total_credits_valides: totalCreditsValides,
      date_generation: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
