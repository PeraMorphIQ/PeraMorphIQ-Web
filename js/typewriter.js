// Typewriter effect for hero location text
class TypewriterEffect {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
        this.isDeleting = false;
        this.isWaiting = false;
        
        this.start();
    }
    
    start() {
        this.type();
    }
    
    type() {
        const current = this.text.substring(0, this.currentIndex);
        this.element.textContent = current;
        
        if (!this.isDeleting && this.currentIndex < this.text.length) {
            // Typing forward
            this.currentIndex++;
            setTimeout(() => this.type(), this.speed);
        } else if (!this.isDeleting && this.currentIndex === this.text.length) {
            // Finished typing, wait before deleting
            this.isWaiting = true;
            setTimeout(() => {
                this.isWaiting = false;
                this.isDeleting = true;
                this.type();
            }, 2000); // Wait 2 seconds
        } else if (this.isDeleting && this.currentIndex > 0) {
            // Deleting
            this.currentIndex--;
            setTimeout(() => this.type(), this.speed / 2); // Delete faster
        } else if (this.isDeleting && this.currentIndex === 0) {
            // Finished deleting, wait before typing again
            this.isDeleting = false;
            setTimeout(() => this.type(), 500); // Short pause before restarting
        }
    }
}

// Initialize typewriter effect when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const typewriterElement = document.querySelector('.typewriter-text');
    if (typewriterElement) {
        const text = typewriterElement.getAttribute('data-text');
        new TypewriterEffect(typewriterElement, text, 80);
    }
});