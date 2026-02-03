const express = require('express');
const pauseController = require('../controllers/pause.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Pause CRUD operations
router.post('/disponibilites/:disponibiliteId/pauses', pauseController.createPause);
router.get('/disponibilites/:disponibiliteId/pauses', pauseController.getPausesByDisponibilite);
router.put('/pauses/:id', pauseController.updatePause);
router.delete('/pauses/:id', pauseController.deletePause);

// Bulk operations
router.put('/disponibilites/:disponibiliteId/pauses', pauseController.setPausesForDisponibilite);

// Get all pauses for a coiffeur
router.get('/coiffeurs/:coiffeurId/pauses', pauseController.getPausesByCoiffeur);

module.exports = router;
