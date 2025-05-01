const data = require("../data.json");
const fs = require('fs');
const path = require('path');

// Get all houses
exports.getCars = (_, res) => {
    try {
        if (!data.cars || !Array.isArray(data.houses)) {
            return res.status(500).json({
                status: "error",
                message: "Invalid data structure"
            });
        }

        return res.status(200).json({
            status: "success",
            data: data.cars
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Get house by ID
exports.getCarById = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid ID format"
            });
        }

        const house = data.cars.find(house => house.id === id);

        if (!house) {
            return res.status(404).json({
                status: "error",
                message: "Car not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: hous
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Update car stock
exports.updateStock = (req, res) => {
    try {
        const { id, quantity } = req.body;

        if (!id || quantity === undefined) {
            return res.status(400).json({
                status: "error",
                message: "ID and quantity are required"
            });
        }

        const carId = parseInt(id);
        if (isNaN(carId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid ID format"
            });
        }

        const carIndex = data.cars.findIndex(car => car.id === carId);

        if (carIndex === -1) {
            return res.status(404).json({
                status: "error",
                message: "Car not found"
            });
        }

        const car = data.cars[carIndex];

        // Check if there's enough stock
        if (car.stock < quantity) {
            return res.status(400).json({
                status: "error",
                message: "Not enough stock available",
                availableStock: car.stock
            });
        }

        // Update stock
        car.stock -= quantity;

        // Save the updated data back to the file
        const dataPath = path.join(__dirname, '../data.json');
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        return res.status(200).json({
            status: "success",
            message: "Stock updated successfully",
            currentStock: car.stock
        });
    } catch (error) {
        console.error("Error updating stock:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

