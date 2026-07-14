import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const marquerLue = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    await notification.update({ lu: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendNotificationToAll = async (req, res) => {
  try {
    const { titre, message } = req.body;
    const users = await User.findAll({ where: { role: 'user' } });
    
    const notifications = [];
    for (const user of users) {
      notifications.push({
        userId: user.id,
        titre,
        message,
        type: 'promo'
      });
    }
    
    await Notification.bulkCreate(notifications);
    
    // Socket.io
    const io = req.app.get('io');
    io.emit('broadcast_notification', { titre, message });
    
    res.json({ message: 'Notification envoyée à tous les utilisateurs' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};