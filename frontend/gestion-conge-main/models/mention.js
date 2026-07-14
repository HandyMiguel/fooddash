'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mention = sequelize.define(
  'Mention',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    libelle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Le libellé de la mention ne peut pas être vide.' },
        len: { args: [2, 100], msg: 'Le libellé doit contenir entre 2 et 100 caractères.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'mention',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Mention;
