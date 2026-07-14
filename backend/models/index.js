// models/index.js
import User from './User.js';
import Plat from './Plat.js';
import Commande from './Commande.js';
import CommandePlat from './CommandePlat.js';
import Notification from './Notification.js';
import Favori from './Favori.js';
import Setting from './Setting.js'; // Ajoutez si présent

// Relations Users - Commandes
User.hasMany(Commande, { foreignKey: 'userId' });
Commande.belongsTo(User, { foreignKey: 'userId' });

// Relations Livreur - Commandes
User.hasMany(Commande, { foreignKey: 'livreurId', as: 'commandesLivreur' });
Commande.belongsTo(User, { foreignKey: 'livreurId', as: 'livreur' });

// Relations Commandes - Plats (Many-to-Many)
Commande.belongsToMany(Plat, { 
  through: CommandePlat, 
  foreignKey: 'commandeId',
  otherKey: 'platId'
});
Plat.belongsToMany(Commande, { 
  through: CommandePlat, 
  foreignKey: 'platId',
  otherKey: 'commandeId'
});

// Relations Users - Notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Relations Users - Favoris
User.hasMany(Favori, { foreignKey: 'userId', as: 'favoris' });
Favori.belongsTo(User, { foreignKey: 'userId' });

// Relations Plats - Favoris
Plat.hasMany(Favori, { foreignKey: 'platId' });
Favori.belongsTo(Plat, { foreignKey: 'platId' });

export { User, Plat, Commande, CommandePlat, Notification, Favori, Setting };