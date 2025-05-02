let houses = [];

async function fetchHouses() {
    try {
        const response = await fetch('http://localhost:8080/api/houses');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success" && Array.isArray(result.data)) {
            houses = result.data;
            displayHouses(result.data);
        } else {
            throw new Error('Invalid data format received from server');
        }
    } catch (error) {
        console.error('Error fetching houses:', error);
        displayError(`Failed to load properties: ${error.message}`);
    }
}

function displayHouses(houses) {
    const rentalGrid = document.querySelector('.rental-grid');
    rentalGrid.innerHTML = '';

    houses.forEach(house => {
        // Combine all available images
        const allImages = [
            ...(house.images.exterior || []),
            ...(house.images.livingRoom || []),
            ...(house.images.bedrooms || []),
            ...(house.images.kitchen || []),
            ...(house.images.bathrooms || [])
        ].filter(img => img);  // Remove any undefined/null values

        const carouselSlides = allImages.map(img => 
            `<img src="http://localhost:8080/img/${img}" 
                 alt="${house.name}" 
                 class="carousel-slide"
                 onerror="this.src='http://localhost:8080/img/default-apartment.jpg'">`
        ).join('');

        const carouselDots = allImages.map((_, index) => 
            `<button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`
        ).join('');

        const houseCard = `
            <div class="rental-card">
                <div class="carousel">
                    <button class="carousel-prev">❮</button>
                    <button class="carousel-next">❯</button>
                    <div class="carousel-container">
                        ${carouselSlides}
                    </div>
                    <div class="carousel-dots">
                        ${carouselDots}
                    </div>
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
                            <p>${house.rating || 'New'}</p>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🏠</span>
                            <p>${house.type || 'Property'}</p>
                        </div>
                    </div>
                    <div class="rental-footer">
                        <button class="book-now" onclick="bookHouse(${house.id})">Book Now</button>
                        <p class="price">€${house.price.toLocaleString()}<span>/month</span></p>
                    </div>
                </div>
            </div>
        `;
        rentalGrid.innerHTML += houseCard;
    });

    // Initialize carousels after DOM is updated
    setTimeout(() => {
        document.querySelectorAll('.carousel').forEach(carouselElement => {
            try {
                new Carousel(carouselElement);
            } catch (error) {
                console.error('Error initializing carousel:', error);
            }
        });
    }, 0);
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
