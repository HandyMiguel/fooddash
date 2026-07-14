'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { sequelize } = require('./models');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globaux ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // 🔥 utile si auth plus tard
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use(notFound);

// ── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Démarrage serveur ────────────────────────────────────────────────────────
const start = async () => {
  try {
    // 🔥 Vérifie la connexion PostgreSQL
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL OK');

    // 🔥 Sync des tables
    await sequelize.sync();
    console.log('✅ Base de données synchronisée');

    // 🚀 Start serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📌 Environnement : ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error);
    process.exit(1);
  }
};

start();

module.exports = app;