// controllers/settingController.js
import Setting from '../models/Setting.js';

// GET - Récupérer les paramètres
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ where: { id: 1 } });
    
    if (!settings) {
      settings = await Setting.create({ id: 1 });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Erreur chargement settings:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT - Mettre à jour les paramètres
export const updateSettings = async (req, res) => {
  try {
    const {
      restaurantName,
      restaurantEmail,
      restaurantPhone,
      restaurantAddress,
      deliveryFee,
      minOrder,
      notificationsEnabled,
      autoAcceptOrders
    } = req.body;

    let settings = await Setting.findOne({ where: { id: 1 } });
    
    if (!settings) {
      settings = await Setting.create({ id: 1 });
    }

    await settings.update({
      restaurantName,
      restaurantEmail,
      restaurantPhone,
      restaurantAddress,
      deliveryFee,
      minOrder,
      notificationsEnabled,
      autoAcceptOrders
    });

    res.json({ message: 'Paramètres mis à jour', settings });
  } catch (error) {
    console.error('Erreur update settings:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST - Réinitialiser les paramètres
export const resetSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ where: { id: 1 } });
    
    if (settings) {
      await settings.update({
        restaurantName: 'FoodDash',
        restaurantEmail: '',
        restaurantPhone: '',
        restaurantAddress: '',
        deliveryFee: 3.99,
        minOrder: 15.00,
        notificationsEnabled: true,
        autoAcceptOrders: false
      });
    }

    res.json({ message: 'Paramètres réinitialisés' });
  } catch (error) {
    console.error('Erreur reset settings:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};