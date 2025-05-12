const API_URL = 'http://localhost:8080/api';

class ReservationAPI {
    static async getAllReservations() {
        try {
            const response = await fetch(`${API_URL}/reservations`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    }

    static async createReservation(reservationData) {
        try {
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        }
    }

    static async getReservation(id) {
        try {
            const response = await fetch(`${API_URL}/reservations/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching reservation:', error);
            throw error;
        }
    }
}

class HouseAPI {
    static async getAllHouses() {
        try {
            const response = await fetch(`${API_URL}/houses`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching houses:', error);
            throw error;
        }
    }

    static async getHouse(id) {
        try {
            const response = await fetch(`${API_URL}/house/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching house:', error);
            throw error;
        }
    }
}

window.ReservationAPI = ReservationAPI;
window.HouseAPI = HouseAPI;