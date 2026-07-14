// models/Plat.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Plat = sequelize.define('Plat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: 'default-food.jpg'
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  promo: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  note: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  nbAvis: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'Plats',
  timestamps: true
});

export default Plat;