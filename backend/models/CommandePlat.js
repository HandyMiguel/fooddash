import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CommandePlat = sequelize.define('CommandePlat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  commandeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  platId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  prixUnitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

export default CommandePlat;