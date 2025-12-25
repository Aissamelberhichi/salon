const clientScoreService = require('../services/clientScore.service');

class ClientScoreController {
  async getClientScore(req, res, next) {
    try {
      const { clientId } = req.params;
      
      console.log('User accessing score:', { userId: req.user.id, userRole: req.user.role, requestedClientId: clientId });
      
      // Temporarily allow all authenticated users to access scores
      // TODO: Add proper role-based restrictions later

      const clientScore = await clientScoreService.getClientScore(clientId);
      res.status(200).json({
        score: clientScore.score,
        level: clientScore.level,
        requiresDeposit: clientScore.requiresDeposit,
        eventsCount: clientScore.eventsCount,
        events: clientScore.events
      });
    } catch (e) {
      next(e);
    }
  }

  async addClientEvent(req, res, next) {
    try {
      const { clientId } = req.params;
      const { eventType, metadata } = req.body;

      // Verify user can add events (admin, salon owner for their clients, or system)
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'SALON_OWNER') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updatedScore = await clientScoreService.addEvent(clientId, eventType, metadata);
      res.status(201).json({
        score: updatedScore.score,
        level: updatedScore.level,
        requiresDeposit: updatedScore.requiresDeposit,
        eventsCount: updatedScore.eventsCount
      });
    } catch (e) {
      next(e);
    }
  }

  async getClientHistory(req, res, next) {
    try {
      const { clientId } = req.params;
      const { limit = 50 } = req.query;

      // Verify user can only access their own score (unless admin or salon)
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && 
          req.user.role !== 'SALON_OWNER' && req.user.id !== clientId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const history = await clientScoreService.getClientHistory(clientId, parseInt(limit));
      res.status(200).json(history);
    } catch (e) {
      next(e);
    }
  }

  async getAllClientsScores(req, res, next) {
    try {
      // Admin only
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const scores = await clientScoreService.getAllClientsScores();
      res.status(200).json(scores);
    } catch (e) {
      next(e);
    }
  }

  async resetClientScore(req, res, next) {
    try {
      const { clientId } = req.params;

      // Admin only
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const resetScore = await clientScoreService.resetClientScore(clientId);
      res.status(200).json({
        message: 'Client score reset successfully',
        score: resetScore
      });
    } catch (e) {
      next(e);
    }
  }

  // Helper method to check if deposit is required
  async checkDepositRequirement(req, res, next) {
    try {
      const { clientId } = req.params;
      const clientScore = await clientScoreService.getClientScore(clientId);
      
      res.status(200).json({
        requiresDeposit: clientScore.requiresDeposit,
        level: clientScore.level,
        score: clientScore.score
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ClientScoreController();
