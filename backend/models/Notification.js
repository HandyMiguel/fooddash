import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('commande', 'promo', 'systeme'),
    defaultValue: 'systeme'
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  commandeId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

export default Notification;