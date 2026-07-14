'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enseignant = sequelize.define(
  'Enseignant',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    matricule: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Le matricule de l\'enseignant est requis.' },
      },
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom est requis.' },
      },
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le prénom est requis.' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: { msg: 'L\'adresse email n\'est pas valide.' },
      },
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    grade: {
      type: DataTypes.ENUM('Assistant', 'Maître de conférences', 'Professeur', 'Vacataire', 'ATER'),
      allowNull: false,
      defaultValue: 'Assistant',
    },
    specialite: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'enseignant',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Enseignant;
