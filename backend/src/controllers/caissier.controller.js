const prisma = require('../config/database');
const hashService = require('../utils/hash');

class CaissierController {
  // Créer un caissier pour le salon du propriétaire connecté
  async createCaissier(req, res, next) {
    try {
      const { fullName, email, phone, password } = req.body;
      const ownerId = req.user.id;

      // Vérifier que l'utilisateur est propriétaire d'un salon
      const salon = await prisma.salon.findFirst({
        where: { ownerId }
      });

      if (!salon) {
        return res.status(404).json({ error: 'Salon non trouvé' });
      }

      // Vérifier si un caissier existe déjà pour ce salon
      if (salon.caissierId) {
        return res.status(400).json({ error: 'Un caissier est déjà assigné à ce salon' });
      }

      // Créer le caissier
      const passwordHash = await hashService.hash(password);

      const caissier = await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          role: 'CAISSIER',
          passwordHash
        }
      });

      // Assigner le caissier au salon
      await prisma.salon.update({
        where: { id: salon.id },
        data: { caissierId: caissier.id }
      });

      res.status(201).json({
        message: 'Caissier créé avec succès',
        caissier: {
          id: caissier.id,
          fullName: caissier.fullName,
          email: caissier.email,
          phone: caissier.phone,
          isActive: caissier.isActive,
          createdAt: caissier.createdAt
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }
      next(error);
    }
  }

  // Récupérer les caissiers du salon du propriétaire connecté
  async getCaissiers(req, res, next) {
    try {
      const ownerId = req.user.id;

      const salon = await prisma.salon.findFirst({
        where: { ownerId },
        include: {
          caissier: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true
            }
          }
        }
      });

      if (!salon) {
        return res.status(404).json({ error: 'Salon non trouvé' });
      }

      const caissiers = salon.caissier ? [salon.caissier] : [];

      res.status(200).json(caissiers);
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour un caissier
  async updateCaissier(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, email, phone } = req.body;
      const ownerId = req.user.id;

      // Vérifier que le caissier appartient au salon du propriétaire
      const salon = await prisma.salon.findFirst({
        where: {
          ownerId,
          caissierId: id
        }
      });

      if (!salon) {
        return res.status(404).json({ error: 'Caissier non trouvé ou accès non autorisé' });
      }

      const updatedCaissier = await prisma.user.update({
        where: { id },
        data: {
          fullName,
          email,
          phone
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true
        }
      });

      res.status(200).json({
        message: 'Caissier mis à jour avec succès',
        caissier: updatedCaissier
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }
      next(error);
    }
  }

  // Activer/désactiver un caissier
  async toggleCaissierActive(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      // Vérifier que le caissier appartient au salon du propriétaire
      const salon = await prisma.salon.findFirst({
        where: {
          ownerId,
          caissierId: id
        }
      });

      if (!salon) {
        return res.status(404).json({ error: 'Caissier non trouvé ou accès non autorisé' });
      }

      const caissier = await prisma.user.findUnique({ where: { id } });
      if (!caissier) {
        return res.status(404).json({ error: 'Caissier non trouvé' });
      }

      const updatedCaissier = await prisma.user.update({
        where: { id },
        data: { isActive: !caissier.isActive },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true
        }
      });

      res.status(200).json({
        message: `Caissier ${updatedCaissier.isActive ? 'activé' : 'désactivé'} avec succès`,
        caissier: updatedCaissier
      });
    } catch (error) {
      next(error);
    }
  }

  // Supprimer un caissier
  async deleteCaissier(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      // Vérifier que le caissier appartient au salon du propriétaire
      const salon = await prisma.salon.findFirst({
        where: {
          ownerId,
          caissierId: id
        }
      });

      if (!salon) {
        return res.status(404).json({ error: 'Caissier non trouvé ou accès non autorisé' });
      }

      // Retirer le caissier du salon
      await prisma.salon.update({
        where: { id: salon.id },
        data: { caissierId: null }
      });

      // Supprimer le compte utilisateur
      await prisma.user.delete({
        where: { id }
      });

      res.status(200).json({
        message: 'Caissier supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CaissierController();