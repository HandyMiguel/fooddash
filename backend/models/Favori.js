// models/Favori.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Plat from './Plat.js';

const Favori = sequelize.define('Favori', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  platId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Plats',
      key: 'id'
    }
  }
}, {
  tableName: 'favoris',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'platId']
    }
  ]
});

// Associations
Favori.belongsTo(User, { foreignKey: 'userId' });
Favori.belongsTo(Plat, { foreignKey: 'platId' });

User.hasMany(Favori, { foreignKey: 'userId' });
Plat.hasMany(Favori, { foreignKey: 'platId' });

export default Favori;