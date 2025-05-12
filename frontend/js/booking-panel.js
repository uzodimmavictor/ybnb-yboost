class BookingPanel {
    constructor() {
        this.currentProperty = null;
        this.init();
        this.setupEventListeners();
        this.limits = {
            adults: { min: 1, max: 8 },
            children: { min: 0, max: 6 },
            infants: { min: 0, max: 4 },
            pets: { min: 0, max: 2 }
        };
        this.counts = {
            adults: 1,
            children: 0,
            infants: 0,
            pets: 0
        };
        this.selectedDates = {
            checkIn: null,
            checkOut: null
        };
        this.guestFeePerPerson = 25; // Additional fee per guest per night
        this.serviceFeePercentage = 0.15; // 15% service fee
    }

    init() {
        this.panel = document.querySelector('.booking-panel');
        this.overlay = document.querySelector('.overlay');
        this.closeBtn = this.panel.querySelector('.close-panel');
        this.propertyName = this.panel.querySelector('.property-name');
        this.pricePerNight = 0;
        this.calendar1 = document.getElementById('calendar-1');
        this.calendar2 = document.getElementById('calendar-2');
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        
        this.panel.querySelectorAll('.counter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleGuestCount(e));
        });

        this.panel.querySelector('.reserve-btn').addEventListener('click', () => this.handleReserve());
    }

    open(property) {
        if (!property) return;
        this.currentProperty = property;
        
        this.panel.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.propertyName.textContent = property.name;
        this.panel.querySelector('.booking-price').textContent = `€${property.price.toLocaleString()}/month`;
        this.updateTotals();
        this.resetCounters();
        this.initializeCalendars(property);
    }

    close() {
        this.panel.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleGuestCount(e) {
        const btn = e.currentTarget;
        const type = btn.dataset.type;
        const isPlus = btn.classList.contains('plus');
        const count = this.counts[type];
        const limits = this.limits[type];

        if (isPlus && count < limits.max) {
            this.counts[type]++;
        } else if (!isPlus && count > limits.min) {
            this.counts[type]--;
        }

        this.updateCounter(type);
        this.updateButtons();
        this.updateDisplay();
    }

    updateCounter(type) {
        const counter = this.panel.querySelector(`[data-type="${type}"]`).parentNode.querySelector('.count');
        counter.textContent = this.counts[type];
    }

    updateButtons() {
        Object.entries(this.counts).forEach(([type, count]) => {
            const container = this.panel.querySelector(`[data-type="${type}"]`).parentNode;
            const minusBtn = container.querySelector('.minus');
            const plusBtn = container.querySelector('.plus');
            
            minusBtn.disabled = count <= this.limits[type].min;
            plusBtn.disabled = count >= this.limits[type].max;
        });
    }

    resetCounters() {
        this.counts = {
            adults: 1,
            children: 0,
            infants: 0,
            pets: 0
        };
        
        Object.keys(this.counts).forEach(type => {
            this.updateCounter(type);
        });
        this.updateButtons();
    }

    updateTotals() {
        const elements = {
            '.daily-rate': '0',
            '.nights-count': '0',
            '.subtotal': '€0',
            '.service-fee': '€0',
            '.total-price': '€0'
        };

        Object.entries(elements).forEach(([selector, value]) => {
            this.panel.querySelector(selector).textContent = value;
        });

        const bookingDates = this.panel.querySelector('.booking-dates');
        if (bookingDates) bookingDates.innerHTML = '<div class="dates-prompt">Please select check-in and check-out dates</div>';
    }

    initializeCalendars(property) {
        const dailyRate = Math.round(property.price / 30);
        
        // Reset dates when opening booking panel
        this.selectedDates = {
            checkIn: null,
            checkOut: null
        };
        
        // Create calendar with the proper references
        window.calendar = new Calendar(this.calendar1, {
            dailyRate,
            onSelect: (dates) => this.handleDateSelection(dates),
            selectedDates: this.selectedDates
        });
        
        // Store a reference to the calendar instance
        this.calendar = window.calendar;

        if (this.calendar2) {
            this.calendar2.style.display = 'none';
        }
    }

    handleDateSelection(dates) {
        // Store the selected dates in the BookingPanel instance
        if (dates && dates.checkIn) {
            this.selectedDates.checkIn = new Date(dates.checkIn);
        } else {
            this.selectedDates.checkIn = null;
        }
        
        if (dates && dates.checkOut) {
            this.selectedDates.checkOut = new Date(dates.checkOut);
        } else {
            this.selectedDates.checkOut = null;
        }

        console.log("BookingPanel received dates:", this.selectedDates);

        if (!this.selectedDates.checkIn || !this.selectedDates.checkOut) {
            this.updateTotals();
            return;
        }

        // Calculate the night count
        const msPerDay = 1000 * 60 * 60 * 24;
        const nightCount = Math.ceil(
            (this.selectedDates.checkOut - this.selectedDates.checkIn) / msPerDay
        );
        
        // Calculate the price per night based on property price
        const dailyRate = this.currentProperty ? Math.round(this.currentProperty.price / 30) : 0;
        const totalPrice = dailyRate * nightCount;
        const serviceFee = Math.round(totalPrice * 0.15);
        const finalTotal = totalPrice + serviceFee;

        const selectedDates = document.createElement('div');
        selectedDates.className = 'selected-dates';
        selectedDates.innerHTML = `
            <div class="dates-summary">
                <div class="date-range">
                    <strong>${this.formatDateFull(this.selectedDates.checkIn)} - ${this.formatDateFull(this.selectedDates.checkOut)}</strong>
                </div>
                <div class="stay-duration">
                    <span>${nightCount} nights · Average €${dailyRate.toLocaleString()} per night</span>
                </div>
            </div>
            <div class="price-breakdown">
                <div class="price-row">
                    <span>Stay (${nightCount} nights)</span>
                    <span>€${totalPrice.toLocaleString()}</span>
                </div>
                <div class="price-row">
                    <span>Service fee (15%)</span>
                    <span>€${serviceFee.toLocaleString()}</span>
                </div>
                <div class="price-row total">
                    <span>Total</span>
                    <span>€${finalTotal.toLocaleString()}</span>
                </div>
            </div>
        `;

        const bookingDates = this.panel.querySelector('.booking-dates');
        bookingDates.innerHTML = '';
        bookingDates.appendChild(selectedDates);

        // Update summary section
        this.updateSummaryTotals({
            nights: nightCount,
            avgPrice: dailyRate,
            totalPrice,
            serviceFee,
            finalTotal
        });
    }

    updateSummaryTotals(totals) {
        this.panel.querySelector('.daily-rate').textContent = totals.avgPrice.toLocaleString();
        this.panel.querySelector('.nights-count').textContent = totals.nights;
        this.panel.querySelector('.subtotal').textContent = `€${totals.totalPrice.toLocaleString()}`;
        this.panel.querySelector('.service-fee').textContent = `€${totals.serviceFee.toLocaleString()}`;
        this.panel.querySelector('.total-price').textContent = `€${totals.finalTotal.toLocaleString()}`;
    }

    calculateTotals() {
        if (!this.selectedDates.checkIn || !this.selectedDates.checkOut || !this.currentProperty) {
            return null;
        }

        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil(
            (new Date(this.selectedDates.checkOut) - new Date(this.selectedDates.checkIn)) / msPerDay
        );

        const dailyRate = Math.round(this.currentProperty.price / 30);
        const baseTotal = dailyRate * nights;

        const totalGuests = Object.values(this.counts).reduce((a, b) => a + b, 0);
        const extraGuests = Math.max(0, totalGuests - 1);
        const guestFees = extraGuests * this.guestFeePerPerson * nights;

        const subtotal = baseTotal + guestFees;
        const serviceFee = Math.round(subtotal * this.serviceFeePercentage);
        const total = subtotal + serviceFee;

        return {
            nights,
            dailyRate,
            baseTotal,
            guestFees,
            serviceFee,
            total,
            totalGuests
        };
    }

    updateDisplay() {
        const totals = this.calculateTotals();
        if (!totals) {
            this.resetDisplay();
            return;
        }

        const selectedDatesEl = document.createElement('div');
        selectedDatesEl.className = 'selected-dates';
        selectedDatesEl.innerHTML = `
            <div class="dates-summary">
                <div class="date-range">
                    <strong>${this.formatDate(this.selectedDates.checkIn)} - ${this.formatDate(this.selectedDates.checkOut)}</strong>
                </div>
                <div class="stay-details">
                    <span>${totals.nights} nights · ${totals.totalGuests} guest${totals.totalGuests > 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="price-breakdown">
                <div class="price-row">
                    <span>Base rate (€${totals.dailyRate} × ${totals.nights} nights)</span>
                    <span>€${totals.baseTotal.toLocaleString()}</span>
                </div>
                ${totals.guestFees > 0 ? `
                <div class="price-row">
                    <span>Guest fee (€${this.guestFeePerPerson} × ${totals.nights} nights × ${totals.totalGuests - 1} extra guests)</span>
                    <span>€${totals.guestFees.toLocaleString()}</span>
                </div>` : ''}
                <div class="price-row">
                    <span>Service fee (15%)</span>
                    <span>€${totals.serviceFee.toLocaleString()}</span>
                </div>
                <div class="price-row total">
                    <span>Total</span>
                    <span>€${totals.total.toLocaleString()}</span>
                </div>
            </div>
        `;

        const bookingDates = this.panel.querySelector('.booking-dates');
        bookingDates.innerHTML = '';
        bookingDates.appendChild(selectedDatesEl);

        this.updateSummaryTotals(totals);
    }

    resetDisplay() {
        const elements = {
            '.daily-rate': '0',
            '.nights-count': '0',
            '.subtotal': '€0',
            '.service-fee': '€0',
            '.total-price': '€0'
        };

        Object.entries(elements).forEach(([selector, value]) => {
            const element = this.panel.querySelector(selector);
            if (element) element.textContent = value;
        });

        const bookingDates = this.panel.querySelector('.booking-dates');
        if (bookingDates) {
            bookingDates.innerHTML = '<div class="dates-prompt">Please select check-in and check-out dates</div>';
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateFull(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    handleReserve() {
        if (!this.selectedDates.checkIn || !this.selectedDates.checkOut) {
            alert('Please select check-in and check-out dates');
            return;
        }

        const totals = this.calculateTotals();
        if (!totals) {
            alert('Please select check-in and check-out dates');
            return;
        }

        const bookingDetails = {
            property: this.currentProperty.name,
            dates: `${this.formatDate(this.selectedDates.checkIn)} - ${this.formatDate(this.selectedDates.checkOut)}`,
            guests: totals.totalGuests,
            nights: totals.nights,
            total: `€${totals.total.toLocaleString()}`
        };

        window.paymentPanel.open(bookingDetails);
    }
}

// Initialize booking panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingPanel = new BookingPanel();
});