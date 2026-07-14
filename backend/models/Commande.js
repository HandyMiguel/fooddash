import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee'),
    defaultValue: 'en_attente'
  },
  adresseLivraison: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  livreurId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

export default Commande;