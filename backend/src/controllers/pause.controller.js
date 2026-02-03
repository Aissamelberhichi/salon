const pauseService = require('../services/pause.service');

class PauseController {
  async createPause(req, res, next) {
    try {
      const { disponibiliteId } = req.params;
      const pause = await pauseService.createPause(disponibiliteId, req.body);
      res.status(201).json(pause);
    } catch (error) {
      next(error);
    }
  }

  async getPausesByDisponibilite(req, res, next) {
    try {
      const { disponibiliteId } = req.params;
      const pauses = await pauseService.getPausesByDisponibilite(disponibiliteId);
      res.status(200).json(pauses);
    } catch (error) {
      next(error);
    }
  }

  async getPausesByCoiffeur(req, res, next) {
    try {
      const { coiffeurId } = req.params;
      const pauses = await pauseService.getPausesByCoiffeur(coiffeurId);
      res.status(200).json(pauses);
    } catch (error) {
      next(error);
    }
  }

  async updatePause(req, res, next) {
    try {
      const { id } = req.params;
      const pause = await pauseService.updatePause(id, req.body);
      res.status(200).json(pause);
    } catch (error) {
      next(error);
    }
  }

  async deletePause(req, res, next) {
    try {
      const { id } = req.params;
      const result = await pauseService.deletePause(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async setPausesForDisponibilite(req, res, next) {
    try {
      const { disponibiliteId } = req.params;
      const pauses = await pauseService.setPausesForDisponibilite(disponibiliteId, req.body);
      res.status(200).json(pauses);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PauseController();
