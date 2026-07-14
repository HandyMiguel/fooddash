'use strict';

const express = require('express');
const router = express.Router();

// ── Controllers ───────────────────────────────────────────────────────────────
const authCtrl       = require('../controllers/authController');
const mentionCtrl    = require('../controllers/mentionController');
const parcoursCtrl   = require('../controllers/parcoursController');
const niveauCtrl     = require('../controllers/niveauController');
const etudiantCtrl   = require('../controllers/etudiantController');
const moduleCtrl     = require('../controllers/moduleController');
const noteCtrl       = require('../controllers/noteController');
const adminCtrl      = require('../controllers/adminController');

// ── Middleware ─────────────────────────────────────────────────────────────────
const authMiddleware = require('../middleware/auth');

// ── AUTH (routes publiques) ───────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);

// ── Protection : toutes les routes ci-dessous nécessitent un token JWT ────────
router.use(authMiddleware);

// ── AUTH (protégée) ───────────────────────────────────────────────────────────
router.get('/auth/me', authCtrl.me);

// ── MENTIONS ──────────────────────────────────────────────────────────────────
router.get   ('/mentions',      mentionCtrl.getAll);
router.get   ('/mentions/:id',  mentionCtrl.getById);
router.post  ('/mentions',      mentionCtrl.create);
router.put   ('/mentions/:id',  mentionCtrl.update);
router.delete('/mentions/:id',  mentionCtrl.remove);

// ── PARCOURS ──────────────────────────────────────────────────────────────────
router.get   ('/parcours',      parcoursCtrl.getAll);
router.get   ('/parcours/:id',  parcoursCtrl.getById);
router.post  ('/parcours',      parcoursCtrl.create);
router.put   ('/parcours/:id',  parcoursCtrl.update);
router.delete('/parcours/:id',  parcoursCtrl.remove);

// ── NIVEAUX ───────────────────────────────────────────────────────────────────
router.get   ('/niveaux',       niveauCtrl.getAll);
router.get   ('/niveaux/:id',   niveauCtrl.getById);
router.post  ('/niveaux',       niveauCtrl.create);
router.put   ('/niveaux/:id',   niveauCtrl.update);
router.delete('/niveaux/:id',   niveauCtrl.remove);

// ── ETUDIANTS ─────────────────────────────────────────────────────────────────
router.get   ('/etudiants',              etudiantCtrl.getAll);
router.get   ('/etudiants/:id',          etudiantCtrl.getById);
router.get   ('/etudiants/:id/notes',    etudiantCtrl.getNotes);
router.post  ('/etudiants',              etudiantCtrl.create);
router.put   ('/etudiants/:id',          etudiantCtrl.update);
router.patch ('/etudiants/:id/actif',    etudiantCtrl.toggleActif);
router.delete('/etudiants/:id',          etudiantCtrl.remove);

// ── MODULES ───────────────────────────────────────────────────────────────────
router.get   ('/modules',       moduleCtrl.getAllModules);
router.get   ('/modules/:id',   moduleCtrl.getModuleById);
router.post  ('/modules',       moduleCtrl.createModule);
router.put   ('/modules/:id',   moduleCtrl.updateModule);
router.delete('/modules/:id',   moduleCtrl.deleteModule);

// ── MATIERES ──────────────────────────────────────────────────────────────────
router.get   ('/matieres',      moduleCtrl.getAllMatieres);
router.get   ('/matieres/:id',  moduleCtrl.getMatiereById);
router.post  ('/matieres',      moduleCtrl.createMatiere);
router.put   ('/matieres/:id',  moduleCtrl.updateMatiere);
router.delete('/matieres/:id',  moduleCtrl.deleteMatiere);

// ── NOTES ─────────────────────────────────────────────────────────────────────
router.get   ('/notes',                       noteCtrl.getAll);
router.get   ('/notes/:id',                   noteCtrl.getById);
router.get   ('/notes/releve/:etudiant_id',   noteCtrl.releve);
router.post  ('/notes',                       noteCtrl.create);
router.put   ('/notes/:id',                   noteCtrl.update);
router.delete('/notes/:id',                   noteCtrl.remove);

// ── ANNEES UNIVERSITAIRES ─────────────────────────────────────────────────────
router.get   ('/annees',        adminCtrl.getAllAnnees);
router.get   ('/annees/:id',    adminCtrl.getAnneeById);
router.post  ('/annees',        adminCtrl.createAnnee);
router.put   ('/annees/:id',    adminCtrl.updateAnnee);
router.delete('/annees/:id',    adminCtrl.deleteAnnee);

// ── SESSIONS EXAMEN ───────────────────────────────────────────────────────────
router.get   ('/sessions',      adminCtrl.getAllSessions);
router.get   ('/sessions/:id',  adminCtrl.getSessionById);
router.post  ('/sessions',      adminCtrl.createSession);
router.put   ('/sessions/:id',  adminCtrl.updateSession);
router.delete('/sessions/:id',  adminCtrl.deleteSession);

// ── ENSEIGNANTS ───────────────────────────────────────────────────────────────
router.get   ('/enseignants',       adminCtrl.getAllEnseignants);
router.get   ('/enseignants/:id',   adminCtrl.getEnseignantById);
router.post  ('/enseignants',       adminCtrl.createEnseignant);
router.put   ('/enseignants/:id',   adminCtrl.updateEnseignant);
router.delete('/enseignants/:id',   adminCtrl.deleteEnseignant);

module.exports = router;
