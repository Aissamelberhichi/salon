const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// Limiteur strict pour les tentatives de login (DÉSACTIVÉ POUR LES TESTS)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (réduit de 15 minutes)
  max: 1000, // Augmenté de 5 à 1000 tentatives (pratiquement illimité)
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 1 minute.',
    retryAfter: '1 minute'
  },
  standardHeaders: true, // Retourne les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  // Ne pas limiter les requêtes réussies
  skipSuccessfulRequests: true,
  // Ne compter que les requêtes avec statut 401
  keyGenerator: (req) => {
    return ipKeyGenerator(req) + ':' + (req.body.email || 'unknown');
  }
});

// Limiteur moins strict pour les enregistrements (DÉSACTIVÉ POUR LES TESTS)
const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (réduit de 1 heure)
  max: 1000, // Augmenté de 3 à 1000 tentatives (pratiquement illimité)
  message: {
    error: 'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 minute.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req)
});

// Limiteur pour le rafraîchissement de tokens
const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 rafraîchissements par 15 minutes
  message: {
    error: 'Trop de tentatives de rafraîchissement. Veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req)
});

// Limiteur général pour toutes les routes API
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par 15 minutes par IP
  message: {
    error: 'Trop de requêtes. Veuillez ralentir votre rythme.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req)
});

module.exports = {
  loginLimiter,
  registerLimiter,
  refreshTokenLimiter,
  generalApiLimiter
};
