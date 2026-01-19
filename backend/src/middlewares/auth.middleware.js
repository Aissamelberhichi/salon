const jwtService = require('../utils/jwt');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    console.log('Auth middleware called for:', req.path);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verify(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Pour les caissiers, ajouter les informations du salon
    if (user.role === 'CAISSIER') {
      const salon = await prisma.salon.findFirst({
        where: { caissierId: user.id },
        select: {
          id: true,
          name: true,
          address: true,
          city: true
        }
      });
      user.salon = salon;
    }

    console.log('Authenticated user:', { id: user.id, role: user.role });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const authenticateClient = async (req, res, next) => {
  try {
    console.log('Client auth middleware called for:', req.path);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verify(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Vérifier que l'utilisateur est un client
    if (user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Client role required.' });
    }

    console.log('Authenticated client:', { id: user.id, role: user.role });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticate, authenticateClient, authorize };