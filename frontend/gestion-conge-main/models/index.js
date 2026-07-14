'use strict';

const sequelize = require('../config/database');

// ── Import des modèles ────────────────────────────────────────────────────────
const Mention            = require('./mention');
const Parcours           = require('./parcours');
const Niveau             = require('./niveau');
const Etudiant           = require('./etudiant');
const AnneeUniversitaire = require('./annee_universitaire');
const Module             = require('./module');
const Matiere            = require('./matiere');
const Enseignant         = require('./enseignant');
const SessionExamen      = require('./session_examen');
const Note               = require('./note');
const User               = require('./user');

// ── Associations ──────────────────────────────────────────────────────────────

// Mention ↔ Parcours
Mention.hasMany(Parcours, {
  foreignKey: 'mention_id',
  as: 'parcours',
  onDelete: 'RESTRICT',
});
Parcours.belongsTo(Mention, {
  foreignKey: 'mention_id',
  as: 'mention',
});

// Parcours ↔ Module
Parcours.hasMany(Module, {
  foreignKey: 'parcours_id',
  as: 'modules',
  onDelete: 'RESTRICT',
});
Module.belongsTo(Parcours, {
  foreignKey: 'parcours_id',
  as: 'parcours',
});

// Niveau ↔ Module
Niveau.hasMany(Module, {
  foreignKey: 'niveau_id',
  as: 'modules',
  onDelete: 'RESTRICT',
});
Module.belongsTo(Niveau, {
  foreignKey: 'niveau_id',
  as: 'niveau',
});

// Module ↔ Matiere
Module.hasMany(Matiere, {
  foreignKey: 'module_id',
  as: 'matieres',
  onDelete: 'RESTRICT',
});
Matiere.belongsTo(Module, {
  foreignKey: 'module_id',
  as: 'module',
});

// Parcours ↔ Etudiant
Parcours.hasMany(Etudiant, {
  foreignKey: 'parcours_id',
  as: 'etudiants',
  onDelete: 'RESTRICT',
});
Etudiant.belongsTo(Parcours, {
  foreignKey: 'parcours_id',
  as: 'parcours',
});

// Niveau ↔ Etudiant
Niveau.hasMany(Etudiant, {
  foreignKey: 'niveau_id',
  as: 'etudiants',
  onDelete: 'RESTRICT',
});
Etudiant.belongsTo(Niveau, {
  foreignKey: 'niveau_id',
  as: 'niveau',
});

// AnneeUniversitaire ↔ SessionExamen
AnneeUniversitaire.hasMany(SessionExamen, {
  foreignKey: 'annee_universitaire_id',
  as: 'sessions',
  onDelete: 'RESTRICT',
});
SessionExamen.belongsTo(AnneeUniversitaire, {
  foreignKey: 'annee_universitaire_id',
  as: 'anneeUniversitaire',
});

// Note ↔ Etudiant
Etudiant.hasMany(Note, {
  foreignKey: 'etudiant_id',
  as: 'notes',
  onDelete: 'RESTRICT',
});
Note.belongsTo(Etudiant, {
  foreignKey: 'etudiant_id',
  as: 'etudiant',
});

// Note ↔ Matiere
Matiere.hasMany(Note, {
  foreignKey: 'matiere_id',
  as: 'notes',
  onDelete: 'RESTRICT',
});
Note.belongsTo(Matiere, {
  foreignKey: 'matiere_id',
  as: 'matiere',
});

// Note ↔ AnneeUniversitaire
AnneeUniversitaire.hasMany(Note, {
  foreignKey: 'annee_universitaire_id',
  as: 'notes',
  onDelete: 'RESTRICT',
});
Note.belongsTo(AnneeUniversitaire, {
  foreignKey: 'annee_universitaire_id',
  as: 'anneeUniversitaire',
});

// Note ↔ SessionExamen
SessionExamen.hasMany(Note, {
  foreignKey: 'session_examen_id',
  as: 'notes',
  onDelete: 'RESTRICT',
});
Note.belongsTo(SessionExamen, {
  foreignKey: 'session_examen_id',
  as: 'session',
});

// Note ↔ Enseignant
Enseignant.hasMany(Note, {
  foreignKey: 'enseignant_id',
  as: 'notes',
  onDelete: 'RESTRICT',
});
Note.belongsTo(Enseignant, {
  foreignKey: 'enseignant_id',
  as: 'enseignant',
});

// ── Export ────────────────────────────────────────────────────────────────────
module.exports = {
  sequelize,
  Mention,
  Parcours,
  Niveau,
  Etudiant,
  AnneeUniversitaire,
  Module,
  Matiere,
  Enseignant,
  SessionExamen,
  Note,
  User,
};