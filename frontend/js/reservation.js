document.addEventListener('DOMContentLoaded', async () => {
    // Load houses for the dropdown
    loadHouses();
    
    // Load existing reservations
    loadReservations();
    
    // Set up event listeners
    setupEventListeners();
});

// Load houses for the dropdown
async function loadHouses() {
    try {
        const response = await fetch(`${API_URL}/houses`);
        const result = await response.json();
        
        if (result.status === "success" && Array.isArray(result.data)) {
            const houseSelect = document.getElementById('house-select');
            
            result.data.forEach(house => {
                const option = document.createElement('option');
                option.value = house.id;
                option.textContent = `${house.title} - €${house.price}/night`;
                houseSelect.appendChild(option);
            });
            
            // Set up price calculation when house changes
            houseSelect.addEventListener('change', updatePrice);
            
            // Also update price when dates change
            document.getElementById('check-in').addEventListener('change', updatePrice);
            document.getElementById('check-out').addEventListener('change', updatePrice);
        }
    } catch (error) {
        console.error('Error loading houses:', error);
        showMessage('Failed to load available properties', 'error');
    }
}

// Calculate and update price based on selected house and dates
function updatePrice() {
    const houseSelect = document.getElementById('house-select');
    const checkIn = document.getElementById('check-in').value;
    const checkOut = document.getElementById('check-out').value;
    
    if (houseSelect.value && checkIn && checkOut) {
        // Get selected house option text to extract price
        const selectedOption = houseSelect.options[houseSelect.selectedIndex];
        
        // Extract price per night from the option text (format: "House Name - €XXX/night")
        const priceMatch = selectedOption.textContent.match(/€(\d+)\/night/);
        
        if (priceMatch && priceMatch[1]) {
            const pricePerNight = parseInt(priceMatch[1]);
            
            // Calculate number of nights
            const startDate = new Date(checkIn);
            const endDate = new Date(checkOut);
            const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
            
            // Calculate total
            const total = pricePerNight * nights;
            
            // Update total field
            document.getElementById('total').value = total;
        }
    }
}

// Load existing reservations with house details
async function loadReservations() {
    try {
        const container = document.getElementById('reservations-container');
        container.innerHTML = '<div class="loading">Loading your reservations...</div>';
        
        // Get all reservations
        const reservations = await ReservationAPI.getAllReservations();
        
        if (reservations.length === 0) {
            container.innerHTML = `
                <div class="no-reservations">
                    <p>You don't have any reservations yet.</p>
                    <p>Book your dream stay below!</p>
                </div>
            `;
            return;
        }
        
        // Get all houses for reference
        const housesResponse = await fetch(`${API_URL}/houses`);
        const housesResult = await housesResponse.json();
        const houses = housesResult.status === "success" ? housesResult.data : [];
        
        // Create a map for quick house lookup
        const houseMap = {};
        houses.forEach(house => {
            houseMap[house.id] = house;
        });
        
        // Sort reservations with upcoming first
        reservations.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
        
        // Generate HTML for each reservation
        container.innerHTML = reservations.map(reservation => {
            const house = houseMap[reservation.houseId] || {};
            const houseImage = getHouseMainImage(house);
            const nights = calculateNights(reservation.checkIn, reservation.checkOut);
            
            return `
                <div class="reservation-card ${reservation.status === 'cancelled' ? 'cancelled' : ''}">
                    <div class="reservation-header">
                        <h3>Reservation #${reservation.id}</h3>
                        <span class="reservation-status status-${reservation.status}">${reservation.status}</span>
                    </div>
                    <div class="reservation-content">
                        <div class="house-preview">
                            <img src="http://localhost:8080/img/${houseImage}" 
                                 alt="${house.name || 'Property'}" 
                                 onerror="this.src='http://localhost:8080/img/default-apartment.jpg'"
                                 class="house-thumbnail">
                        </div>
                        <div class="reservation-info">
                            <h4 class="house-name">${house.name || 'Property'}</h4>
                            <p class="house-location">${house.location || ''}</p>
                            
                            <div class="reservation-details">
                                <div class="detail-item">
                                    <span class="detail-label">Check-in:</span>
                                    <span class="detail-value">${formatDate(reservation.checkIn)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Check-out:</span>
                                    <span class="detail-value">${formatDate(reservation.checkOut)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Stay:</span>
                                    <span class="detail-value">${nights} night${nights !== 1 ? 's' : ''}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Guests:</span>
                                    <span class="detail-value">${reservation.guests}</span>
                                </div>
                                <div class="detail-item price-item">
                                    <span class="detail-label">Total:</span>
                                    <span class="detail-value">€${reservation.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="reservation-actions">
                        ${reservation.status === 'confirmed' ? 
                            `<button class="action-button cancel-btn" data-id="${reservation.id}">Cancel Reservation</button>` : 
                            ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to cancel buttons
        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', handleCancelReservation);
        });
    } catch (error) {
        console.error('Failed to load reservations:', error);
        const container = document.getElementById('reservations-container');
        container.innerHTML = `
            <div class="error-message">
                <p>Failed to load reservations. Please try again later.</p>
            </div>
        `;
    }
}

// Get the main image for a house
function getHouseMainImage(house) {
    if (!house || !house.images) return 'default-apartment.jpg';
    
    // Try to get the first exterior image
    if (house.images.exterior && house.images.exterior.length > 0) {
        return house.images.exterior[0];
    }
    
    // Or try other image categories
    const categories = ['livingRoom', 'bedrooms', 'kitchen', 'bathrooms'];
    for (const category of categories) {
        if (house.images[category] && house.images[category].length > 0) {
            return house.images[category][0];
        }
    }
    
    return 'default-apartment.jpg';
}

// Calculate number of nights
function calculateNights(checkIn, checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    return Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Set up event listeners
function setupEventListeners() {
    // Form submission for creating new reservation
    const form = document.getElementById('reservation-form');
    if (form) {
        form.addEventListener('submit', handleCreateReservation);
    }
}

// Handle reservation form submission
async function handleCreateReservation(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const reservationData = {
        houseId: formData.get('houseId'),
        checkIn: formData.get('checkIn'),
        checkOut: formData.get('checkOut'),
        guests: parseInt(formData.get('guests')),
        total: parseInt(formData.get('total'))
    };
    
    // Validate form data
    if (!reservationData.houseId) {
        showMessage('Please select a property', 'error');
        return;
    }
    
    if (!reservationData.checkIn || !reservationData.checkOut) {
        showMessage('Please select check-in and check-out dates', 'error');
        return;
    }
    
    const startDate = new Date(reservationData.checkIn);
    const endDate = new Date(reservationData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
        showMessage('Check-in date cannot be in the past', 'error');
        return;
    }
    
    if (endDate <= startDate) {
        showMessage('Check-out date must be after check-in date', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Create reservation
        const result = await ReservationAPI.createReservation(reservationData);
        
        if (result.status === 'success') {
            // Reset form
            e.target.reset();
            
            // Show success message
            showMessage('Reservation created successfully!', 'success');
            
            // Scroll to the reservations section
            const reservationsSection = document.getElementById('reservations-container');
            if (reservationsSection) {
                reservationsSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Reload reservations to show the new one
            loadReservations();
            
            // Add a highlight effect to the new reservation
            setTimeout(() => {
                const newReservation = document.querySelector('.reservation-card');
                if (newReservation) {
                    newReservation.classList.add('highlight-new');
                    setTimeout(() => {
                        newReservation.classList.remove('highlight-new');
                    }, 3000);
                }
            }, 1000);
        } else {
            showMessage(result.message || 'Failed to create reservation', 'error');
        }
    } catch (error) {
        console.error('Error creating reservation:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle cancel reservation
async function handleCancelReservation(e) {
    const reservationId = e.target.dataset.id;
    
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }
    
    try {
        // Show loading state
        e.target.textContent = 'Cancelling...';
        e.target.disabled = true;
        
        // Call API to cancel reservation
        const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Reload reservations to reflect the change
            loadReservations();
            showMessage('Reservation cancelled successfully', 'success');
        } else {
            showMessage(result.message || 'Failed to cancel reservation', 'error');
            // Reset button state
            e.target.textContent = 'Cancel Reservation';
            e.target.disabled = false;
        }
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        showMessage('An error occurred. Please try again.', 'error');
        // Reset button state
        e.target.textContent = 'Cancel Reservation';
        e.target.disabled = false;
    }
}

// Show message in the booking-message div
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('booking-message');
    messageEl.textContent = message;
    messageEl.className = `booking-message ${type}`;
    
    // Clear the message after 5 seconds
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'booking-message';
    }, 5000);
}