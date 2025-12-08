// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const salonRoutes = require('./salon.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/salons', salonRoutes);

module.exports = router;