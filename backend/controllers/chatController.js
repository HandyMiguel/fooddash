import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const ChatMessage = sequelize.define('ChatMessage', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomId:     { type: DataTypes.STRING,  allowNull: false },
  senderId:   { type: DataTypes.INTEGER, allowNull: false },
  senderName: { type: DataTypes.STRING,  allowNull: false },
  senderRole: { type: DataTypes.ENUM('client', 'admin', 'bot'), defaultValue: 'client' },
  message:    { type: DataTypes.TEXT,    allowNull: false },
  isRead:     { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

export const ChatRoom = sequelize.define('ChatRoom', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomId:       { type: DataTypes.STRING,  allowNull: false, unique: true },
  clientId:     { type: DataTypes.INTEGER, allowNull: false },
  clientName:   { type: DataTypes.STRING,  allowNull: false },
  status:       { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
  lastMessage:  { type: DataTypes.TEXT,    allowNull: true },
  lastActivity: { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
  unreadAdmin:  { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

export const getHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: { roomId: req.params.roomId },
      order: [['createdAt', 'ASC']],
      limit: 100,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.findAll({
      where: { status: 'open' },
      order: [['lastActivity', 'DESC']],
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

export const getOrCreateRoom = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const roomId = `room_client_${userId}`;
    const [room] = await ChatRoom.findOrCreate({
      where:    { roomId },
      defaults: { clientId: userId, clientName: userName, roomId },
    });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

export const closeRoom = async (req, res) => {
  try {
    await ChatRoom.update({ status: 'closed' }, { where: { roomId: req.params.roomId } });
    res.json({ message: 'Conversation fermée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    await ChatMessage.update(
      { isRead: true },
      { where: { roomId: req.params.roomId, isRead: false } }
    );
    // ✅ Guillemets doubles → Postgres respecte la casse
    await ChatRoom.update(
      { unreadAdmin: 0 },
      { where: { roomId: req.params.roomId } }
    );
    res.json({ message: 'Messages marqués comme lus' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};