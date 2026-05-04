// ========================================
// CAROUSEL DE SCREENSHOTS
// ========================================
class ScreenshotCarousel {
    constructor() {
        this.screenshots = document.querySelectorAll('.phone-slide');
        this.dots = document.querySelectorAll('.control-dot');
        this.currentIndex = 0;
        this.autoplayInterval = null;
        
        this.init();
    }
    
    init() {
        // Event listeners para los dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Autoplay
        this.startAutoplay();
        
        // Pausar autoplay cuando el mouse está sobre el teléfono
        const phoneMockup = document.querySelector('.phone-mockup');
        if (phoneMockup) {
            phoneMockup.addEventListener('mouseenter', () => this.stopAutoplay());
            phoneMockup.addEventListener('mouseleave', () => this.startAutoplay());
        }
    }
    
    goToSlide(index) {
        // Remover clase active de screenshot actual
        this.screenshots[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex].classList.remove('active');
        
        // Actualizar índice
        this.currentIndex = index;
        
        // Añadir clase active al nuevo screenshot
        this.screenshots[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex].classList.add('active');
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.screenshots.length;
        this.goToSlide(nextIndex);
    }
    
    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // Cambiar cada 3 segundos
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
class NavbarScroll {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.lastScroll = 0;
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.navbar.style.boxShadow = 'var(--shadow-lg)';
            } else {
                this.navbar.style.boxShadow = 'var(--shadow-sm)';
            }
            
            this.lastScroll = currentScroll;
        });
    }
}

// ========================================
// SMOOTH SCROLL
// ========================================
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // 80px offset para el navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ========================================
// INTERSECTION OBSERVER PARA ANIMACIONES
// ========================================
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observar elementos
        document.querySelectorAll('.feature-card, .step').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new ScreenshotCarousel();
    new NavbarScroll();
    new SmoothScroll();
    new ScrollAnimations();
    
    console.log('🚀 SAMM Landing Page cargada correctamente');
});

// ========================================
// BOTONES CTA
// ========================================
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('¡Descarga próximamente disponible! 📱');
        // Aquí podrías redirigir a la Play Store cuando esté disponible
        // window.location.href = 'URL_DE_LA_PLAY_STORE';
    });
});