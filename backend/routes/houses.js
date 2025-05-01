const express = require("express");
const router = express.Router();
const controllers = require("../controllers/house");
const path = require('path');

// Define routes 
router.get('/api/houses', controllers.getHouses);
router.get('/api/house/:id', controllers.getHouseById);

// Serve images from the img directory
router.get('/img/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '../img', imageName);
    res.sendFile(imagePath);
});

module.exports = router;