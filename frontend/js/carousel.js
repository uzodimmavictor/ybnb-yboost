class Carousel {
    constructor(element) {
        if (!element) return;
        
        this.carousel = element;
        this.container = element.querySelector('.carousel-container');
        this.slides = element.querySelectorAll('.carousel-slide');
        this.dots = element.querySelectorAll('.carousel-dot');
        this.currentIndex = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const prevBtn = this.carousel.querySelector('.carousel-prev');
        const nextBtn = this.carousel.querySelector('.carousel-next');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
        if (nextBtn) nextBtn.addEventListener('click', () => this.next());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch events
        this.carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.carousel.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.carousel.addEventListener('touchend', () => this.handleTouchEnd());
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
    }

    handleTouchEnd() {
        const diff = this.touchStartX - this.touchEndX;
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) this.next();
            else this.prev();
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateCarousel();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateCarousel();
    }

    updateCarousel() {
        this.container.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
}

// Make Carousel available globally
window.Carousel = Carousel;
