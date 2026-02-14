const authService = require('../services/auth.service');

class AuthController {
  async registerClient(req, res, next) {
    try {
      const result = await authService.registerClient(req.body);
      
      // Set HttpOnly cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data without tokens
      const { accessToken, refreshToken, ...responseData } = result;
      res.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async registerSalonOwner(req, res, next) {
    try {
      const result = await authService.registerSalonOwner(req.body);
      
      // Set HttpOnly cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data without tokens
      const { accessToken, refreshToken, ...responseData } = result;
      res.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      
      // Set HttpOnly cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data without tokens
      const { accessToken, refreshToken, ...responseData } = result;
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
      }
      
      const tokens = await authService.refreshToken(refreshToken);
      
      // Set new HttpOnly cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(200).json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Clear cookies
      res.cookie('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0)
      });
      
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0)
      });
      
      res.status(200).json({ message: 'Logged out successfully' });
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

      // S'assurer que emailVerified est inclus
      if (!userData.emailVerified) {
        const prisma = require('../config/database');
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { emailVerified: true }
        });
        userData = { ...userData, emailVerified: user.emailVerified };
      }

      res.status(200).json({ user: userData });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();