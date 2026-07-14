import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import sequelize from './config/database.js';

import authRoutes         from './routes/authRoutes.js';
import platRoutes         from './routes/platRoutes.js';
import commandeRoutes     from './routes/commandeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import favorisRoutes      from './routes/favorisRoutes.js';
import settingRoutes      from './routes/settingRoute.js';
import uploadRoutes       from './routes/upload.js';
import chatRoutes         from './routes/chatRoutes.js';
import { ChatMessage, ChatRoom } from './controllers/chatController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// ── Middleware Socket.io : vérifie le JWT ──────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentification requise'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId   = decoded.id;
    socket.data.userRole = decoded.role;
    next();
  } catch {
    next(new Error('Token invalide'));
  }
});

app.set('io', io);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/plats',         platRoutes);
app.use('/api/commandes',     commandeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favoris',       favorisRoutes);
app.use('/api/settings',      settingRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/chat',          chatRoutes);

app.get('/', (req, res) => res.json({ message: 'API FoodDash' }));

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ message: 'Fichier trop volumineux. Maximum 5MB' });
  if (err.message?.includes('Type de fichier'))
    return res.status(400).json({ message: err.message });
  console.error('Erreur:', err);
  res.status(500).json({ message: 'Erreur serveur' });
});

// ── Socket.io ──────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`✅ Client connecté: ${socket.id} (userId: ${socket.data.userId})`);

  // ── Commandes ──
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('nouvelle_commande', (data) => {
    io.emit('admin_notification', data);
  });

  socket.on('update_statut', (data) => {
    io.to(`user_${data.userId}`).emit('statut_update', data);
  });

  // ── Chat client ──
  socket.on('chat:join', async ({ userId, userName }) => {
    const roomId = `room_client_${userId}`;
    socket.join(roomId);
    socket.data.roomId   = roomId;
    socket.data.userName = userName;
    console.log(`💬 ${userName} rejoint ${roomId}`);

    try {
      const [room] = await ChatRoom.findOrCreate({
        where:    { roomId },
        defaults: { clientId: userId, clientName: userName, roomId },
      });
      if (room.status === 'closed') {
        await room.update({ status: 'open', lastActivity: new Date() });
      }
      io.to('admin_room').emit('chat:newRoom', {
        roomId,
        clientId:     userId,
        clientName:   userName,
        lastActivity: new Date(),
        unreadAdmin:  room.unreadAdmin,
      });
    } catch (err) {
      console.error('chat:join error:', err);
    }
  });

  // ── Chat admin ──
  socket.on('chat:joinAdmin', () => {
    socket.join('admin_room');
    console.log(`👑 Admin dans admin_room: ${socket.id}`);
  });

  socket.on('chat:joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Admin rejoint room: ${roomId}`);
  });

  // ── Message ──
  socket.on('chat:message', async ({ roomId, senderId, senderName, senderRole, message }) => {
    if (!roomId || !message?.trim()) return;
    console.log(`📨 [${senderRole}] ${senderName} → ${roomId}: ${message}`);

    try {
      const saved = await ChatMessage.create({
        roomId, senderId, senderName, senderRole, message,
      });

      // ✅ Guillemets doubles autour de "unreadAdmin" → Postgres respecte la casse
      const inc = senderRole === 'client'
        ? { unreadAdmin: sequelize.literal('"unreadAdmin" + 1') }
        : {};

      await ChatRoom.update(
        { lastMessage: message, lastActivity: new Date(), ...inc },
        { where: { roomId } }
      );

      const payload = {
        id:         saved.id,
        roomId,
        senderId,
        senderName,
        senderRole,
        message,
        createdAt:  saved.createdAt,
        isRead:     false,
      };

      io.to(roomId).emit('chat:message', payload);

      if (senderRole === 'client') {
        io.to('admin_room').emit('chat:unread', { roomId, senderName, message });
      }
    } catch (err) {
      console.error('chat:message error:', err);
      socket.emit('chat:error', { message: "Erreur lors de l'envoi" });
    }
  });

  // ── Typing ──
  socket.on('chat:typing', ({ roomId, name, isTyping }) => {
    socket.to(roomId).emit('chat:typing', { name, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Déconnecté: ${socket.id}`);
  });
});

// Créer dossier uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erreur de synchronisation:', err));