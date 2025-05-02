class PaymentPanel {
    constructor() {
        this.panel = document.querySelector('.payment-panel');
        this.closeBtn = this.panel.querySelector('.close-payment');
        this.paymentOptions = this.panel.querySelectorAll('input[name="payment"]');
        this.confirmBtn = this.panel.querySelector('.confirm-payment');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => this.handlePaymentChange(e));
        });
        this.confirmBtn.addEventListener('click', () => this.handlePayment());
    }

    open(bookingDetails) {
        this.panel.classList.add('active');
        this.updateSummary(bookingDetails);
    }

    close() {
        this.panel.classList.remove('active');
    }

    updateSummary(details) {
        const summary = this.panel.querySelector('.summary-details');
        summary.innerHTML = `
            <div class="summary-item">
                <span>Dates</span>
                <span>${details.dates}</span>
            </div>
            <div class="summary-item">
                <span>Guests</span>
                <span>${details.guests} guests</span>
            </div>
            <div class="summary-item total">
                <span>Total Amount</span>
                <span>${details.total}</span>
            </div>
        `;
    }

    handlePaymentChange(e) {
        const forms = this.panel.querySelectorAll('.payment-form');
        forms.forEach(form => form.classList.remove('active'));
        const selectedForm = this.panel.querySelector(`.${e.target.value}-form`);
        if (selectedForm) selectedForm.classList.add('active');
    }

    handlePayment() {
        // Add payment processing logic here
        alert('Payment successful! Thank you for your booking.');
        this.close();
    }
}

window.paymentPanel = new PaymentPanel();
