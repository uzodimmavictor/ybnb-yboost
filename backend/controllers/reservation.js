const fs = require('fs');
const path = require('path');
const reservationsPath = path.join(__dirname, '../data/reservations.json');

// Helper to read reservations file
const readReservations = () => {
    try {
        const rawData = fs.readFileSync(reservationsPath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading reservations file:', error);
        return { reservations: [] };
    }
};

// Helper to write reservations file
const writeReservations = (data) => {
    try {
        fs.writeFileSync(reservationsPath, JSON.stringify(data, null, 4));
        return true;
    } catch (error) {
        console.error('Error writing reservations file:', error);
        return false;
    }
};

// Get all reservations
exports.getAllReservations = (req, res) => {
    try {
        console.log('Fetching all reservations...');
        const data = readReservations();
        
        if (!data || !data.reservations || !Array.isArray(data.reservations)) {
            console.error('Invalid data structure in reservations.json');
            return res.status(500).json({
                status: "error",
                message: "Data structure error"
            });
        }

        return res.status(200).json({
            status: "success",
            data: data.reservations
        });
    } catch (error) {
        console.error('Error in getAllReservations:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Get reservation by ID
exports.getReservationById = (req, res) => {
    try {
        const id = req.params.id;
        const data = readReservations();
        const reservation = data.reservations.find(r => r.id === id);

        if (!reservation) {
            return res.status(404).json({
                status: "error",
                message: "Reservation not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: reservation
        });
    } catch (error) {
        console.error('Error in getReservationById:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Create new reservation
exports.createReservation = (req, res) => {
    try {
        const { houseId, checkIn, checkOut, guests, total } = req.body;
        
        // Validate required fields
        if (!houseId || !checkIn || !checkOut || !guests || !total) {
            return res.status(400).json({
                status: "error",
                message: "Missing required reservation information"
            });
        }

        const data = readReservations();
        
        // Generate new ID (simple increment)
        const newId = data.reservations.length > 0 
            ? (parseInt(data.reservations[data.reservations.length - 1].id) + 1).toString()
            : "1";
        
        const newReservation = {
            id: newId,
            houseId,
            checkIn,
            checkOut,
            guests,
            total,
            status: "confirmed"  // Default status
        };
        
        data.reservations.push(newReservation);
        
        if (writeReservations(data)) {
            return res.status(201).json({
                status: "success",
                message: "Reservation created successfully",
                data: newReservation
            });
        } else {
            return res.status(500).json({
                status: "error",
                message: "Failed to save reservation"
            });
        }
    } catch (error) {
        console.error('Error in createReservation:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Update reservation
exports.updateReservation = (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        
        const data = readReservations();
        const index = data.reservations.findIndex(r => r.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                status: "error",
                message: "Reservation not found"
            });
        }
        
        // Update reservation with new data
        data.reservations[index] = { ...data.reservations[index], ...updates };
        
        if (writeReservations(data)) {
            return res.status(200).json({
                status: "success",
                message: "Reservation updated successfully",
                data: data.reservations[index]
            });
        } else {
            return res.status(500).json({
                status: "error",
                message: "Failed to update reservation"
            });
        }
    } catch (error) {
        console.error('Error in updateReservation:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// Cancel reservation
exports.cancelReservation = (req, res) => {
    try {
        const id = req.params.id;
        
        const data = readReservations();
        const index = data.reservations.findIndex(r => r.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                status: "error",
                message: "Reservation not found"
            });
        }
        
        // Update status to cancelled
        data.reservations[index].status = "cancelled";
        
        if (writeReservations(data)) {
            return res.status(200).json({
                status: "success",
                message: "Reservation cancelled successfully",
                data: data.reservations[index]
            });
        } else {
            return res.status(500).json({
                status: "error",
                message: "Failed to cancel reservation"
            });
        }
    } catch (error) {
        console.error('Error in cancelReservation:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};