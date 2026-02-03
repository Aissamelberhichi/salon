const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreurs Prisma (base de données)
  if (err.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002':
        // Contrainte unique violée
        const target = err.meta?.target;
        if (target?.includes('email')) {
          return res.status(409).json({ 
            message: 'Cet email est déjà utilisé par un autre compte',
            field: 'email',
            code: 'EMAIL_ALREADY_EXISTS'
          });
        }
        if (target?.includes('phone')) {
          return res.status(409).json({ 
            message: 'Ce numéro de téléphone est déjà utilisé par un autre compte',
            field: 'phone',
            code: 'PHONE_ALREADY_EXISTS'
          });
        }
        return res.status(409).json({ 
          message: 'Une donnée unique est déjà utilisée',
          code: 'UNIQUE_CONSTRAINT_VIOLATION'
        });
      
      case 'P2025':
        // Enregistrement non trouvé
        return res.status(404).json({ 
          message: 'Ressource non trouvée',
          code: 'RECORD_NOT_FOUND'
        });
      
      case 'P2003':
        // Contrainte de clé étrangère
        return res.status(400).json({ 
          message: 'Référence invalide',
          code: 'FOREIGN_KEY_CONSTRAINT'
        });
    }
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Erreur de validation',
      errors: err.errors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Token invalide',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expiré',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erreurs d'authentification personnalisées
  if (err.message === 'Invalid credentials') {
    return res.status(401).json({ 
      message: 'Email ou mot de passe incorrect',
      code: 'INVALID_CREDENTIALS'
    });
  }

  if (err.message === 'Account is inactive') {
    return res.status(403).json({ 
      message: 'Votre compte est désactivé',
      code: 'ACCOUNT_INACTIVE'
    });
  }

  if (err.message === 'Email not verified') {
    return res.status(403).json({ 
      message: 'Veuillez vérifier votre adresse email avant de vous connecter',
      code: 'EMAIL_NOT_VERIFIED',
      action: 'RESEND_VERIFICATION'
    });
  }

  // Erreurs de vérification email
  if (err.message === 'Token de vérification invalide ou expiré') {
    return res.status(400).json({ 
      message: 'Le lien de vérification est invalide ou a expiré',
      code: 'VERIFICATION_TOKEN_INVALID'
    });
  }

  if (err.message === 'Email déjà vérifié') {
    return res.status(400).json({ 
      message: 'Votre email est déjà vérifié',
      code: 'EMAIL_ALREADY_VERIFIED'
    });
  }

  if (err.message === 'Utilisateur non trouvé') {
    return res.status(404).json({ 
      message: 'Aucun compte trouvé avec cet email',
      code: 'USER_NOT_FOUND'
    });
  }

  // Erreurs de rate limiting
  if (err.status === 429) {
    return res.status(429).json({ 
      message: err.message || 'Trop de requêtes, veuillez réessayer plus tard',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    message: message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

module.exports = errorHandler;