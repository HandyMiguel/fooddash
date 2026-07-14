'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Niveau = sequelize.define(
  'Niveau',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    libelle: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Le libellé du niveau est requis.' },
      },
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Ordre d\'affichage du niveau',
      validate: {
        min: { args: [1], msg: 'L\'ordre minimum est 1.' },
        max: { args: [10], msg: 'L\'ordre maximum est 10.' },
      },
    },
  },
  {
    tableName: 'niveau',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Niveau;
