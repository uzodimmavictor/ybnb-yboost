const express = require("express");
const router = express.Router();
const controllers = require("../controllers/house");
const path = require('path');

// Define routes 
router.get('/houses', controllers.getCars);
router.get('/house/:id', controllers.getCarById);
router.post('/house/updateStock', controllers.updateStock);

// Serve images from the img directory
router.get('/img/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '../img', imageName);
    res.sendFile(imagePath);
});

module.exports = router;