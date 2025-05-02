const data = require("../data.json");
const fs = require('fs');
const path = require('path');

// Get all houses
exports.getHouses = (req, res) => {
    try {
        console.log('Fetching all houses...');
        
        if (!data || !data.houses || !Array.isArray(data.houses)) {
            console.error('Invalid data structure in data.json');
            return res.status(500).json({
                status: "error",
                message: "Data structure error"
            });
        }

        return res.status(200).json({
            status: "success",
            data: data.houses
        });
    } catch (error) {
        console.error('Error in getHouses:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Get house by ID
exports.getHouseById = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const house = data.houses.find(house => house.id === id);

        if (!house) {
            return res.status(404).json({
                status: "error",
                message: "House not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: house
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

