'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Matiere = sequelize.define(
  'Matiere',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Le code de la matière est requis.' },
      },
    },
    libelle: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le libellé de la matière est requis.' },
      },
    },
    coefficient: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1.0,
      validate: {
        min: { args: [0.5], msg: 'Le coefficient minimum est 0.5.' },
        max: { args: [10], msg: 'Le coefficient maximum est 10.' },
      },
    },
    volume_horaire: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      comment: 'Volume horaire en heures',
    },
    type_matiere: {
      type: DataTypes.ENUM('CM', 'TD', 'TP', 'PROJET'),
      allowNull: false,
      defaultValue: 'CM',
      comment: 'Cours Magistral, Travaux Dirigés, Travaux Pratiques, Projet',
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'module', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  },
  {
    tableName: 'matiere',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Matiere;
