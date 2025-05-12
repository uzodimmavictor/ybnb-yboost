class Calendar {
    constructor(element, options = {}) {
        this.element = element;
        this.currentDate = new Date();
        this.selectedDates = options.selectedDates || { checkIn: null, checkOut: null, prices: {}, totalPrice: 0, nights: 0 };
        this.onSelect = options.onSelect || (() => {});
        this.dailyRate = options.dailyRate || 0;
        this.baseRate = options.dailyRate || 100;
        this.render();
    }

    generateDailyPrice() {
        // Generate a price variation of ±20% from base rate
        const variation = (Math.random() * 0.4 - 0.2); // -20% to +20%
        return Math.round(this.baseRate * (1 + variation));
    }

    render() {
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        
        this.element.innerHTML = `
            <div class="calendar-header">
                <button class="prev-month">←</button>
                <div class="calendar-title">
                    <h3>${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <p class="calendar-subtitle">${this.getDateSelectionText()}</p>
                </div>
                <button class="next-month">→</button>
            </div>
            ${this.renderCalendarBody(year, month)}
        `;

        this.attachEvents();
    }

    getDateSelectionText() {
        if (!this.selectedDates.checkIn) return 'Select check-in date';
        if (!this.selectedDates.checkOut) return 'Select check-out date';
        return `${this.formatDate(this.selectedDates.checkIn)} - ${this.formatDate(this.selectedDates.checkOut)} (€${this.selectedDates.priceData.totalPrice})`;
    }

    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    renderCalendarBody(year, month) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();

        let html = '<div class="calendar-days">';
        html += days.map(d => `<div class="calendar-weekday">${d}</div>`).join('');

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = this.isDateSelected(date);
            const isPast = date < today;

            html += this.getDayHtml(date, isPast, isSelected);
        }

        html += '</div>';
        return html;
    }

    isDateSelected(date) {
        const checkIn = this.selectedDates.checkIn;
        const checkOut = this.selectedDates.checkOut;
        
        if (!checkIn) return false;
        if (!checkOut) return date.toDateString() === checkIn.toDateString();
        
        return date >= checkIn && date <= checkOut;
    }

    isInRange(date) {
        const { checkIn, checkOut } = this.selectedDates;
        if (!checkIn || !checkOut) return false;
        return date > checkIn && date < checkOut;
    }

    getDayHtml(date, isDisabled, isSelected) {
        const dayPrice = this.generateDailyPrice();
        const today = new Date();
        const isPast = date < today;
        const isInRange = this.isInRange(date);
        const isCheckIn = this.selectedDates.checkIn && 
                          this.selectedDates.checkIn.toDateString() === date.toDateString();
        const isCheckOut = this.selectedDates.checkOut && 
                           this.selectedDates.checkOut.toDateString() === date.toDateString();

        let classes = ['calendar-day'];
        if (isDisabled) classes.push('disabled');
        if (isSelected) classes.push('selected');
        if (isInRange) classes.push('in-range');
        if (isCheckIn) classes.push('check-in');
        if (isCheckOut) classes.push('check-out');

        return `
            <div class="${classes.join(' ')}"
                 data-date="${date.toISOString()}"
                 data-price="${dayPrice}">
                <span class="day">${date.getDate()}</span>
                ${!isPast ? `<span class="daily-price">€${dayPrice}</span>` : ''}
                ${isCheckIn ? '<span class="date-label">Check-in</span>' : ''}
                ${isCheckOut ? '<span class="date-label">Check-out</span>' : ''}
            </div>
        `;
    }

    handleDateClick(element) {
        const date = new Date(element.dataset.date);
        const price = parseInt(element.dataset.price);
        
        if (!this.selectedDates.checkIn || date < this.selectedDates.checkIn) {
            // First click or new check-in date
            this.selectedDates = {
                checkIn: date,
                checkOut: null,
                priceData: {
                    totalPrice: 0,
                    avgPrice: 0,
                    nights: 0
                }
            };
            // Store the price for this day
            this.selectedDates.priceData[date.toISOString()] = price;
        } else if (!this.selectedDates.checkOut) {
            // Second click - selecting checkout date
            if (date.getTime() === this.selectedDates.checkIn.getTime()) {
                // Don't allow same day for check-in and check-out
                return;
            }
            
            this.selectedDates.checkOut = date;
            // Store the price for this day
            this.selectedDates.priceData[date.toISOString()] = price;
            this.calculateDateRangePrices();
        } else {
            // Reset selection if already have check-in and check-out
            this.selectedDates = {
                checkIn: date,
                checkOut: null,
                priceData: {
                    totalPrice: 0,
                    avgPrice: 0,
                    nights: 0
                }
            };
            // Store the price for this day
            this.selectedDates.priceData[date.toISOString()] = price;
        }

        this.render();
        
        // Create a clone of the dates object to prevent reference issues
        const datesClone = {
            checkIn: this.selectedDates.checkIn ? new Date(this.selectedDates.checkIn) : null,
            checkOut: this.selectedDates.checkOut ? new Date(this.selectedDates.checkOut) : null,
            priceData: {...this.selectedDates.priceData}
        };
        
        // Pass the cloned object to the callback
        if (typeof this.onSelect === 'function') {
            this.onSelect(datesClone);
        }
    }

    calculateDateRangePrices() {
        const { checkIn, checkOut, priceData } = this.selectedDates;
        let totalPrice = 0;
        let dayCount = 0;
        
        if (!checkIn || !checkOut) return;
        
        let currentDate = new Date(checkIn);
        while (currentDate <= checkOut) {
            const dateStr = currentDate.toISOString();
            const dayPrice = priceData[dateStr] || this.generateDailyPrice();
            
            // Store price for this day
            priceData[dateStr] = dayPrice;
            
            totalPrice += dayPrice;
            dayCount++;
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        this.selectedDates.priceData.totalPrice = totalPrice;
        this.selectedDates.priceData.nights = dayCount;
        this.selectedDates.priceData.avgPrice = Math.round(totalPrice / dayCount);
    }

    attachEvents() {
        this.element.querySelector('.prev-month').addEventListener('click', () => this.changeMonth(-1));
        this.element.querySelector('.next-month').addEventListener('click', () => this.changeMonth(1));
        
        // Add direct click handlers to calendar days
        const calendarDays = this.element.querySelectorAll('.calendar-day:not(.empty):not(.disabled)');
        calendarDays.forEach(day => {
            day.addEventListener('click', (e) => {
                this.handleDateClick(e.currentTarget);
            });
        });
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }
}

// Do not initialize window.calendar here - it will be initialized in BookingPanel class
// window.calendar = new Calendar(document.getElementById('calendar-1'));