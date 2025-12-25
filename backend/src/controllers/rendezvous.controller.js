const rdvService = require('../services/rendezvous.service');
const prisma = require('../config/database');

class RendezVousController {
  async getNearbySalons(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;
      const salons = await rdvService.getNearbySalons(
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        radius ? parseInt(radius) : 10
      );
      res.status(200).json(salons);
    } catch (error) {
      next(error);
    }
  }

async getAvailableSlots(req, res, next) {
  try {
    const { coiffeurId, date, serviceId } = req.query;
    if (!coiffeurId || !date) {
      return res.status(400).json({ error: 'coiffeurId and date are required' });
    }

    // Guard: if coiffeur's salon is deactivated, return no slots
    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      include: { salon: { select: { isActive: true } } }
    });
    if (!coiffeur) return res.status(404).json({ error: 'Coiffeur not found' });
    if (coiffeur.salon && coiffeur.salon.isActive === false) {
      return res.status(200).json([]);
    }

    const slots = await rdvService.getAvailableSlots(coiffeurId, date, serviceId);
    res.status(200).json(slots);
  } catch (error) {
    next(error);
  }
}

async createRendezVous(req, res, next) {
  try {
    const { salonId } = req.body;
    if (!salonId) return res.status(400).json({ error: 'Salon ID required' });

    // Guard: salon must be active
    const salon = await prisma.salon.findUnique({ where: { id: salonId }, select: { isActive: true } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    if (salon.isActive === false) {
      return res.status(400).json({ error: 'Ce salon est désactivé. Réservation impossible.' });
    }

    const rdv = await rdvService.createRendezVous(req.user.id, req.body);
    res.status(201).json(rdv);
  } catch (error) {
    next(error);
  }
}

  async getMyRendezVous(req, res, next) {
    try {
      const { status } = req.query;
      const rdvs = await rdvService.getClientRendezVous(req.user.id, status);
      res.status(200).json(rdvs);
    } catch (error) {
      next(error);
    }
  }

  async getSalonRendezVous(req, res, next) {
    try {
      const { salonId } = req.params;
      const { status, date } = req.query;
      const rdvs = await rdvService.getSalonRendezVous(salonId, status, date);
      res.status(200).json(rdvs);
    } catch (error) {
      next(error);
    }
  }

  async getCoiffeurRendezVous(req, res, next) {
    try {
      const { coiffeurId } = req.params;
      const { date } = req.query;
      const rdvs = await rdvService.getCoiffeurRendezVous(coiffeurId, date);
      res.status(200).json(rdvs);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const rdv = await rdvService.updateRendezVousStatus(
        id,
        req.user.id,
        status,
        req.user.role
      );
      res.status(200).json(rdv);
    } catch (error) {
      next(error);
    }
  }

  async getRendezVousById(req, res, next) {
    try {
      const { id } = req.params;
      const rdv = await rdvService.getRendezVousById(id);
      res.status(200).json(rdv);
    } catch (error) {
      next(error);
    }
  }

  async setCoiffeurDisponibilite(req, res, next) {
    try {
      const { coiffeurId } = req.params;
      const { disponibilites } = req.body;
      const result = await rdvService.setCoiffeurDisponibilite(
        coiffeurId,
        req.user.id,
        disponibilites
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RendezVousController();