const serviceService = require('../services/service.service');

class ServiceController {
  async createService(req, res, next) {
    try {
      const { salonId } = req.params;
      const service = await serviceService.createService(salonId, req.user.id, req.body);
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  }

  async getServices(req, res, next) {
    try {
      const { salonId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      const services = await serviceService.getServicesBySalon(salonId, includeInactive);
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const service = await serviceService.updateService(id, req.user.id, req.body);
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      const result = await serviceService.deleteService(id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();