const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur',
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
};

module.exports = {
  errorHandler,
  notFound,
};