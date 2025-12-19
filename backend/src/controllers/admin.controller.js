const adminService = require('../services/admin.service');

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
      const rdvs = await adminService.listReservations({ status, date, salonId });
      res.status(200).json(rdvs);
    } catch (e) { next(e); }
  }
}

module.exports = new AdminController();