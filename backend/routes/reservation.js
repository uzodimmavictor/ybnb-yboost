const express = require('express');
const router = express.Router();
const controllers = require('../controllers/reservation');

// Reservation endpoints
router.get('/reservations', controllers.getAllReservations);
router.get('/reservations/:id', controllers.getReservationById);
router.post('/reservations', controllers.createReservation);
router.put('/reservations/:id', controllers.updateReservation);
router.patch('/reservations/:id/cancel', controllers.cancelReservation);

module.exports = router;