const authService = require('../services/auth.service');

class AuthController {
  async registerClient(req, res, next) {
    try {
      const result = await authService.registerClient(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async registerSalonOwner(req, res, next) {
    try {
      const result = await authService.registerSalonOwner(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      let userData = req.user;

      // Pour les caissiers, inclure les informations du salon
      if (req.user.role === 'CAISSIER') {
        const prisma = require('../config/database');
        const salon = await prisma.salon.findFirst({
          where: { caissierId: req.user.id },
          select: {
            id: true,
            name: true,
            city: true,
            address: true
          }
        });
        if (salon) {
          userData = { ...req.user, salon };
        }
      }

      res.status(200).json({ user: userData });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();