const favoriteService = require('../services/favorite.service.prisma');

// Ajouter un salon aux favoris
exports.addToFavorites = async (req, res) => {
  try {
    const { salonId } = req.body;
    const clientId = req.user.id;

    const favorite = await favoriteService.addToFavorites(clientId, salonId);

    res.status(201).json({
      message: 'Salon ajouté aux favoris avec succès',
      favorite
    });
  } catch (error) {
    console.error('Erreur ajout favoris:', error);
    if (error.message === 'Salon non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Ce salon est déjà dans vos favoris') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Retirer un salon des favoris
exports.removeFromFavorites = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clientId = req.user.id;

    const result = await favoriteService.removeFromFavorites(clientId, salonId);

    res.json(result);
  } catch (error) {
    console.error('Erreur retrait favoris:', error);
    if (error.message === 'Ce salon n\'est pas dans vos favoris') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir tous les favoris d'un client
exports.getFavorites = async (req, res) => {
  try {
    const clientId = req.user.id;

    const favorites = await favoriteService.getFavorites(clientId);

    res.json(favorites);
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Vérifier si un salon est dans les favoris
exports.isFavorite = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clientId = req.user.id;

    const result = await favoriteService.isFavorite(clientId, salonId);

    res.json(result);
  } catch (error) {
    console.error('Erreur vérification favoris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
