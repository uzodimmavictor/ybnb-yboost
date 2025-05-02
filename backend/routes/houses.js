const express = require('express');
const router = express.Router();
const controllers = require('../controllers/house');
const path = require('path');

// Remove /api prefix as it's now handled in app.js
router.get('/houses', controllers.getHouses);
router.get('/house/:id', controllers.getHouseById);

// Serve images from the img directory
router.get('/img/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '../img', imageName);
    res.sendFile(imagePath);
});

module.exports = router;