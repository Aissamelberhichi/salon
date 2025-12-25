const adminService = require('../services/admin.service');
const prisma = require('../config/database');

class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getStats();
      res.status(200).json(stats);
    } catch (e) { next(e); }
  }

  async listSalons(req, res, next) {
    try {
      const { q, isActive, pending } = req.query;
      const salons = await adminService.listSalons({ q, isActive, pending: pending === 'true' });
      res.status(200).json(salons);
    } catch (e) { next(e); }
  }

  async approveSalon(req, res, next) {
    try {
      const { id } = req.params;
      const salon = await adminService.approveSalon(id);
      res.status(200).json(salon);
    } catch (e) { next(e); }
  }

  async toggleSalonActive(req, res, next) {
    try {
      const { id } = req.params;
      const salon = await adminService.toggleSalonActive(id);
      res.status(200).json(salon);
    } catch (e) { next(e); }
  }

  async listReservations(req, res, next) {
    try {
      const { status, date, salonId } = req.query;

      // Si l'utilisateur est un caissier, filtrer par son salon
      let finalSalonId = salonId;
      if (req.user.role === 'CAISSIER') {
        // Trouver le salon du caissier
        const salon = await prisma.salon.findFirst({
          where: { caissierId: req.user.id }
        });
        if (!salon) {
          return res.status(403).json({ error: 'Aucun salon assigné à ce caissier' });
        }
        finalSalonId = salon.id;
      }

      const rdvs = await adminService.listReservations({ status, date, salonId: finalSalonId });
      res.status(200).json(rdvs);
    } catch (e) { next(e); }
  }
  async listClients(req, res, next) {
  try {
    const { q, isActive } = req.query;
    const clients = await adminService.listClients({ q, isActive });
    res.status(200).json(clients);
  } catch (e) { next(e); }
}

async toggleClientActive(req, res, next) {
  try {
    const { id } = req.params;
    const client = await adminService.toggleClientActive(id);
    res.status(200).json(client);
  } catch (e) { next(e); }
}
}

module.exports = new AdminController();