'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parcours = sequelize.define(
  'Parcours',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    libelle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le libellé du parcours ne peut pas être vide.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mention_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mention',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  },
  {
    tableName: 'parcours',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['libelle', 'mention_id'],
        name: 'unique_parcours_per_mention',
      },
    ],
  }
);

module.exports = Parcours;
