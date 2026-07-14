'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionExamen = sequelize.define(
  'SessionExamen',
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
        notEmpty: { msg: 'Le libellé de la session est requis.' },
      },
    },
    type_session: {
      type: DataTypes.ENUM('Normale', 'Rattrapage', 'Spéciale'),
      allowNull: false,
      defaultValue: 'Normale',
    },
    date_debut: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    date_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isAfterDebut(value) {
          if (this.date_debut && value && value < this.date_debut) {
            throw new Error('La date de fin doit être postérieure ou égale à la date de début.');
          }
        },
      },
    },
    annee_universitaire_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'annee_universitaire', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  },
  {
    tableName: 'session_examen',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['libelle', 'annee_universitaire_id'],
        name: 'unique_session_per_annee',
      },
    ],
  }
);

module.exports = SessionExamen;
