const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// Limiteur strict pour les tentatives de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives par fenêtre de 15 minutes
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
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

// Limiteur moins strict pour les enregistrements
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Maximum 3 enregistrements par heure par IP (production)
  message: {
    error: 'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure'
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
