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
      res.status(200).json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();