// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const salonRoutes = require('./salon.routes');
const serviceRoutes = require('./service.routes');
const coiffeurRoutes = require('./coiffeur.routes');
const rdvRoutes = require('./rendezvous.routes');
const adminRoutes = require('./admin.routes');
const reviewRoutes = require('./review.routes');
const clientScoreRoutes = require('./clientScore.routes');
const caissierRoutes = require('./caissier.routes');
const favoriteRoutes = require('./favorite.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/salons', salonRoutes);
router.use('/services', serviceRoutes);
router.use('/coiffeurs', coiffeurRoutes);
router.use('/rdv', rdvRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes); // or just add endpoints under /salons/:id/reviews as shown
router.use('/client-score', clientScoreRoutes);
router.use('/caissiers', caissierRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;