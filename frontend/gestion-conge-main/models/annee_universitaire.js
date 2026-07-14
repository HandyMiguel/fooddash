'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnneeUniversitaire = sequelize.define(
  'AnneeUniversitaire',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    libelle: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Ex: 2023-2024',
      validate: {
        notEmpty: { msg: 'Le libellé de l\'année universitaire est requis.' },
      },
    },
    annee_debut: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'L\'année de début doit être un nombre entier.' },
        min: { args: [2000], msg: 'L\'année de début doit être >= 2000.' },
        max: { args: [2100], msg: 'L\'année de début doit être <= 2100.' },
      },
    },
    annee_fin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'L\'année de fin doit être un nombre entier.' },
        min: { args: [2000], msg: 'L\'année de fin doit être >= 2000.' },
        max: { args: [2100], msg: 'L\'année de fin doit être <= 2100.' },
        isAfterDebut(value) {
          if (this.annee_debut && value <= this.annee_debut) {
            throw new Error('L\'année de fin doit être supérieure à l\'année de début.');
          }
        },
      },
    },
    en_cours: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'annee_universitaire',
    timestamps: true,
    underscored: true,
  }
);

module.exports = AnneeUniversitaire;
