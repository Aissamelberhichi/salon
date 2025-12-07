const prisma = require('../config/database');
const hashService = require('../utils/hash');
const jwtService = require('../utils/jwt');

class AuthService {
  async registerClient(data) {
    const { fullName, email, phone, password } = data;

    const passwordHash = await hashService.hash(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        role: 'CLIENT',
        passwordHash
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    const tokens = this.generateTokens(user);

    return { user, ...tokens };
  }

  async registerSalonOwner(data) {
    const { fullName, email, phone, password } = data;

    const passwordHash = await hashService.hash(password);

    // Create user and salon in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          phone,
          role: 'SALON_OWNER',
          passwordHash
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      const salon = await tx.salon.create({
        data: {
          ownerId: user.id,
          name: `${fullName}'s Salon`
        }
      });

      return { user, salon };
    });

    const tokens = this.generateTokens(result.user);

    return { user: result.user, salon: result.salon, ...tokens };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        passwordHash: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await hashService.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    const tokens = this.generateTokens(userWithoutPassword);

    return { user: userWithoutPassword, ...tokens };
  }

  async refreshToken(refreshToken) {
    const decoded = jwtService.verify(refreshToken);

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
      throw new Error('User not found or inactive');
    }

    const tokens = this.generateTokens(user);
    return tokens;
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwtService.generateAccessToken(payload);
    const refreshToken = jwtService.generateRefreshToken({ id: user.id });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();