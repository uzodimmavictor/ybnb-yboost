const data = require("../data.json");
const fs = require('fs');
const path = require('path');

// Get all houses
exports.getHouses = (_, res) => {
    try {
        if (!data.houses || !Array.isArray(data.houses)) {
            return res.status(500)
                .header('Content-Type', 'application/json')
                .json({
                    status: "error",
                    message: "Invalid data structure"
                });
        }

        return res.status(200)
            .header('Content-Type', 'application/json')
            .json({
                status: "success",
                data: data.houses
            });
    } catch (error) {
        console.error("Error fetching houses:", error);
        return res.status(500)
            .header('Content-Type', 'application/json')
            .json({
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

