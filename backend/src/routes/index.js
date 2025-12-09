// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const salonRoutes = require('./salon.routes');
const serviceRoutes = require('./service.routes');
const coiffeurRoutes = require('./coiffeur.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/salons', salonRoutes);
router.use('/services', serviceRoutes);
router.use('/coiffeurs', coiffeurRoutes);

module.exports = router;