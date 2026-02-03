const prisma = require('../config/database');
const hashService = require('../utils/hash');
const jwtService = require('../utils/jwt');
const emailService = require('../utils/emailService');

class AuthService {
  async registerClient(data) {
    const { fullName, email, phone, password } = data;

    const passwordHash = await hashService.hash(password);
    
    // Générer le token de vérification email
    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        role: 'CLIENT',
        passwordHash,
        emailVerificationToken,
        emailVerificationExpires
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpires: true,
        createdAt: true
      }
    });

    // Envoyer l'email de vérification
    try {
      console.log(' Envoi d\'email de vérification à:', email);
      console.log(' Token généré:', emailVerificationToken.substring(0, 10) + '...');
      console.log(' Nom complet:', fullName);
      
      await emailService.sendVerificationEmail(email, emailVerificationToken, fullName);
      console.log(' Email de vérification envoyé avec succès à:', email);
    } catch (error) {
      console.error(' Erreur lors de l\'envoi de l\'email de vérification:', error);
      console.error(' Détails de l\'erreur:', error.message);
      console.error(' Configuration Gmail:', {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS
      });
      // Ne pas bloquer l'inscription si l'email échoue
    }

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
          passwordHash,
          isActive: false  // Les gérants de salon sont inactifs par défaut
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
          name: `${fullName}'s Salon`,
          isActive: false  // Les salons sont inactifs par défaut
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
        emailVerified: true,
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

    // Vérifier si l'email est vérifié (uniquement pour les clients)
    if (user.role === 'CLIENT' && !user.emailVerified) {
      throw new Error('Email not verified');
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

    console.log('🔑 Tokens générés pour l\'utilisateur:', user.email);
    console.log('🔑 AccessToken:', accessToken.substring(0, 10) + '...');
    console.log('🔑 RefreshToken:', refreshToken.substring(0, 10) + '...');

    return { accessToken, refreshToken };
  }

  // Vérifier l'email avec le token
  async verifyEmail(token) {
    console.log('🔍 Recherche de l\'utilisateur avec le token...');
    
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    console.log('📋 Résultat de la recherche:', user ? 'Utilisateur trouvé' : 'Utilisateur non trouvé');
    
    if (user) {
      console.log('👤 Utilisateur trouvé:', {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        expires: user.emailVerificationExpires,
        now: new Date()
      });
    }

    if (!user) {
      console.log('❌ Token invalide ou expiré');
      throw new Error('Token de vérification invalide ou expiré');
    }

    // Mettre à jour l'utilisateur
    console.log('✅ Mise à jour de l\'utilisateur...');
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true
      }
    });

    console.log('✅ Utilisateur mis à jour avec succès');
    return updatedUser;
  }

  // Renvoyer l'email de vérification
  async resendVerificationEmail(email) {
    console.log('🔍 Recherche de l\'utilisateur pour renvoi:', email);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('📋 Résultat de la recherche:', user ? 'Utilisateur trouvé' : 'Utilisateur non trouvé');

    if (!user) {
      console.log('❌ Utilisateur non trouvé pour l\'email:', email);
      throw new Error('Utilisateur non trouvé');
    }

    if (user.emailVerified) {
      console.log('❌ Email déjà vérifié pour:', email);
      throw new Error('Email déjà vérifié');
    }

    console.log('📧 Génération d\'un nouveau token pour:', email);
    // Générer un nouveau token
    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    console.log('🔄 Mise à jour du token dans la base de données');
    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires
      }
    });

    console.log('📧 Envoi de l\'email de vérification');
    // Envoyer l'email
    await emailService.sendVerificationEmail(email, emailVerificationToken, user.fullName);

    console.log('✅ Email de vérification renvoyé avec succès');
    return { message: 'Email de vérification renvoyé avec succès' };
  }

  // Demander la réinitialisation du mot de passe
  async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou pas
      return { message: 'Si cet email existe, un lien de réinitialisation sera envoyé' };
    }

    // Générer un token de réinitialisation
    const resetToken = emailService.generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Stocker le token (utiliser le champ emailVerificationToken pour le reset)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: resetToken,
        emailVerificationExpires: resetExpires
      }
    });

    // Envoyer l'email
    await emailService.sendPasswordResetEmail(email, resetToken, user.fullName);

    return { message: 'Email de réinitialisation envoyé avec succès' };
  }

  // Réinitialiser le mot de passe
  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Token de réinitialisation invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await hashService.hash(newPassword);

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}

module.exports = new AuthService();