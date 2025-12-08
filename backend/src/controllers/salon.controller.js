const salonService = require('../services/salon.service');

class SalonController {
  async createSalon(req, res, next) {
    try {
      const salon = await salonService.createSalon(req.user.id, req.body);
      res.status(201).json(salon);
    } catch (error) {
      next(error);
    }
  }

  async updateSalon(req, res, next) {
    try {
      const salon = await salonService.updateSalon(req.params.id, req.user.id, req.body);
      res.status(200).json(salon);
    } catch (error) {
      next(error);
    }
  }

  async getSalon(req, res, next) {
    try {
      const salon = await salonService.getSalonById(req.params.id);
      res.status(200).json(salon);
    } catch (error) {
      next(error);
    }
  }

  async getMySalon(req, res, next) {
    try {
      const salon = await salonService.getMySalon(req.user.id);
      if (!salon) {
        return res.status(404).json({ error: 'No salon found for this user' });
      }
      res.status(200).json(salon);
    } catch (error) {
      next(error);
    }
  }

  async addImage(req, res, next) {
    try {
      const image = await salonService.addImage(req.params.id, req.user.id, req.body);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const result = await salonService.deleteImage(req.params.imageId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateHours(req, res, next) {
    try {
      const salon = await salonService.updateHours(req.params.id, req.user.id, req.body.hours);
      res.status(200).json(salon);
    } catch (error) {
      next(error);
    }
  }

  async getAllSalons(req, res, next) {
    try {
      const result = await salonService.getAllSalons(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalonController();