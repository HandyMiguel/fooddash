import { Commande, CommandePlat, Plat, User, Notification } from '../models/index.js';

export const createCommande = async (req, res) => {
  try {
    const { plats, adresseLivraison, notes } = req.body;
    
    let total = 0;
    const platsDetails = [];
    
    for (const item of plats) {
      const plat = await Plat.findByPk(item.platId);
      if (!plat || !plat.disponible) {
        return res.status(400).json({ message: `Plat ${item.platId} non disponible` });
      }
      const prix = plat.promo > 0 ? plat.prix * (1 - plat.promo / 100) : plat.prix;
      total += prix * item.quantite;
      platsDetails.push({ plat, quantite: item.quantite, prixUnitaire: prix });
    }

    const commande = await Commande.create({
      userId: req.user.id,
      total,
      adresseLivraison,
      notes,
      statut: 'en_attente'
    });

    for (const detail of platsDetails) {
      await CommandePlat.create({
        commandeId: commande.id,
        platId: detail.plat.id,
        quantite: detail.quantite,
        prixUnitaire: detail.prixUnitaire
      });
    }

    // Notification admin
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await Notification.create({
        userId: admin.id,
        titre: 'Nouvelle commande',
        message: `Commande #${commande.id} de ${req.user.nom}`,
        type: 'commande',
        commandeId: commande.id
      });
    }

    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserCommandes = async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Plat,
        through: { attributes: ['quantite', 'prixUnitaire'] }
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      include: [
        { model: User, attributes: ['id', 'nom', 'email'] },
        { model: Plat, through: { attributes: ['quantite', 'prixUnitaire'] } }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findByPk(req.params.id, {
      include: [User]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await commande.update({ statut });

    // Notification client
    const messages = {
      confirmee: 'Commande confirmée ✅',
      en_preparation: 'En cuisine 🔥',
      prete: 'C\'est prêt 🛵',
      livree: 'Bon appétit 🍽️',
      annulee: 'Commande annulée ❌'
    };

    await Notification.create({
      userId: commande.userId,
      titre: `Commande #${commande.id}`,
      message: messages[statut] || 'Statut mis à jour',
      type: 'commande',
      commandeId: commande.id
    });

    // Socket.io emission
    req.app.get('io').to(`user_${commande.userId}`).emit('notification', {
      titre: `Commande #${commande.id}`,
      message: messages[statut]
    });

    res.json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommandesDisponibles = async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: {
        statut: 'prete',
        livreurId: null
      },
      include: [
        { model: User, attributes: ['id', 'nom', 'email', 'telephone', 'adresse'] },
        { model: Plat, through: { attributes: ['quantite', 'prixUnitaire'] } }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLivreurCommandes = async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { livreurId: req.user.id },
      include: [
        { model: User, attributes: ['id', 'nom', 'email', 'telephone', 'adresse'] },
        { model: Plat, through: { attributes: ['quantite', 'prixUnitaire'] } }
      ],
      order: [['updatedAt', 'DESC']]
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const accepterLivraison = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: [User]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (commande.statut !== 'prete' || commande.livreurId !== null) {
      return res.status(400).json({ message: 'Cette commande ne peut pas être acceptée pour livraison' });
    }

    await commande.update({
      livreurId: req.user.id,
      statut: 'en_livraison'
    });

    // Notification client
    await Notification.create({
      userId: commande.userId,
      titre: `Commande #${commande.id}`,
      message: 'Votre commande est en cours de livraison 🛵 (Livreur en route !)',
      type: 'commande',
      commandeId: commande.id
    });

    // Socket.io emission
    req.app.get('io').to(`user_${commande.userId}`).emit('notification', {
      titre: `Commande #${commande.id}`,
      message: 'Votre commande est en cours de livraison 🛵'
    });

    // Informer l'admin
    req.app.get('io').emit('admin_notification', {
      message: `La commande #${commande.id} a été prise en charge par le livreur ${req.user.nom}`
    });

    res.json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const marquerLivree = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: [User]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (commande.livreurId !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas le livreur assigné à cette commande' });
    }

    await commande.update({ statut: 'livree' });

    // Notification client
    await Notification.create({
      userId: commande.userId,
      titre: `Commande #${commande.id}`,
      message: 'Commande livrée ! Bon appétit 🍽️',
      type: 'commande',
      commandeId: commande.id
    });

    // Socket.io emission
    req.app.get('io').to(`user_${commande.userId}`).emit('notification', {
      titre: `Commande #${commande.id}`,
      message: 'Commande livrée ! Bon appétit 🍽️'
    });

    res.json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};