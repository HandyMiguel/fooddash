// models/Setting.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurantName: {
    type: DataTypes.STRING,
    defaultValue: 'FoodDash'
  },
  restaurantEmail: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  restaurantPhone: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  restaurantAddress: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 3.99
  },
  minOrder: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 15.00
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoAcceptOrders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'settings',
  timestamps: true
});

export default Setting;