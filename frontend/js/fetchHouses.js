async function fetchHouses() {
    try {
        const response = await fetch('http://localhost:8080/api/houses', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Log response headers for debugging
        console.log('Response headers:', response.headers);
        
        const text = await response.text();
        console.log('Raw response:', text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid JSON response from server');
        }

        if (result.status === "success" && Array.isArray(result.data)) {
            displayHouses(result.data);
        } else {
            throw new Error(result.message || 'Invalid data structure received from server');
        }
    } catch (error) {
        console.error('Error:', error);
        displayError(`Failed to load houses: ${error.message}`);
    }
}

function displayHouses(houses) {
    const rentalGrid = document.querySelector('.rental-grid');
    rentalGrid.innerHTML = ''; // Clear existing content

    houses.forEach(house => {
        const houseCard = `
            <div class="rental-card">
                <div class="rental-image">
                    <img src="http://localhost:8080/img/${house.images.exterior[0]}" alt="${house.name}">
                    <span class="rental-tag">${house.tag}</span>
                </div>
                <div class="rental-details">
                    <div class="location">
                        <span class="location-icon">📍</span>
                        <p>${house.location}</p>
                    </div>
                    <h4>${house.name}</h4>
                    <div class="rental-features">
                        <div class="feature">
                            <span class="feature-icon">⭐</span>
                            <p>${house.rating}</p>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🏠</span>
                            <p>${house.type}</p>
                        </div>
                    </div>
                    <div class="rental-footer">
                        <button class="book-now" onclick="bookHouse(${house.id})">Book Now</button>
                        <p class="price">₦${house.price.toLocaleString()}<span>/month</span></p>
                    </div>
                </div>
            </div>
        `;
        rentalGrid.innerHTML += houseCard;
    });
}

function displayError(message) {
    const rentalGrid = document.querySelector('.rental-grid');
    rentalGrid.innerHTML = `
        <div class="error-message">
            <p>${message}. Please try again later.</p>
        </div>
    `;
}

function bookHouse(id) {
    // TODO: Implement booking functionality
    console.log(`Booking house with ID: ${id}`);
}

// Load houses when the page loads
document.addEventListener('DOMContentLoaded', fetchHouses);
