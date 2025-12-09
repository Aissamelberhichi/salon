const coiffeurService = require('../services/coiffeur.service');

class CoiffeurController {
  async createCoiffeur(req, res, next) {
    try {
      const { salonId } = req.params;
      const coiffeur = await coiffeurService.createCoiffeur(salonId, req.user.id, req.body);
      res.status(201).json(coiffeur);
    } catch (error) {
      next(error);
    }
  }

  async getCoiffeurs(req, res, next) {
    try {
      const { salonId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      const coiffeurs = await coiffeurService.getCoiffeursBySalon(salonId, includeInactive);
      res.status(200).json(coiffeurs);
    } catch (error) {
      next(error);
    }
  }

  async updateCoiffeur(req, res, next) {
    try {
      const { id } = req.params;
      const coiffeur = await coiffeurService.updateCoiffeur(id, req.user.id, req.body);
      res.status(200).json(coiffeur);
    } catch (error) {
      next(error);
    }
  }

  async deleteCoiffeur(req, res, next) {
    try {
      const { id } = req.params;
      const result = await coiffeurService.deleteCoiffeur(id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoiffeurController();