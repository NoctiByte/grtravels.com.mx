/**
 * GR Travels - Controlador de sliders
 * Versión optimizada con manejo de errores y rendimiento mejorado
 * 
 * NOTA: Este archivo ahora solo maneja el Hero Slider principal.
 * La funcionalidad de testimonios se gestiona exclusivamente en testimonials.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar SOLO el Hero Slider con manejo de errores
    try {
        console.log('Inicializando Hero Slider...');
        initHeroSlider();
        
        // La inicialización de testimonios ahora se maneja en testimonials.js
        // para evitar conflictos y duplicidad de código
        
    } catch (error) {
        console.error('Error al inicializar Hero Slider:', error);
    }
});

/**
 * Inicializa el slider principal del hero
 */
function initHeroSlider() {
    const heroSlider = {
        container: document.querySelector('.hero-slider'),
        slides: document.querySelectorAll('.hero-slider .slide'),
        currentIndex: 0,
        interval: null,
        animationInProgress: false,
        
        init: function() {
            // Verificación de elementos DOM necesarios
            if (!this.container) {
                console.warn('Hero Slider: No se encontró el contenedor .hero-slider');
                return;
            }
            
            if (this.slides.length <= 0) {
                console.warn('Hero Slider: No se encontraron slides');
                return;
            }
            
            // Si solo hay un slide, simplemente mostrar sin navegación
            if (this.slides.length === 1) {
                this.slides[0].classList.add('active');
                return;
            }
            
            // Asegurar que el primer slide esté activo
            if (!document.querySelector('.slide.active')) {
                this.slides[0].classList.add('active');
            } else {
                // Si ya hay un slide activo, actualizar el índice
                for (let i = 0; i < this.slides.length; i++) {
                    if (this.slides[i].classList.contains('active')) {
                        this.currentIndex = i;
                        break;
                    }
                }
            }
            
            // Crear los dots de navegación
            this.createDots();
            
            // Configurar eventos táctiles para móviles
            this.setupTouchEvents();
            
            // Configurar eventos de teclado para accesibilidad
            this.setupKeyboardEvents();
            
            // Iniciar rotación automática
            this.startAutoplay();
            
            // Manejar cambios de visibilidad
            this.setupVisibilityChange();
            
            console.log(`Hero Slider inicializado con ${this.slides.length} slides`);
        },
        
        createDots: function() {
            const dotsContainer = document.querySelector('.hero-slider .dots');
            if (!dotsContainer) {
                console.warn('Hero Slider: No se encontró el contenedor de dots');
                return;
            }
            
            // Limpiar contenedor si ya tiene dots
            dotsContainer.innerHTML = '';
            
            // Crear un dot por cada slide
            for (let i = 0; i < this.slides.length; i++) {
                const dot = document.createElement('button');
                dot.className = i === this.currentIndex ? 'dot active' : 'dot';
                dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
                
                // Añadir evento de clic
                dot.addEventListener('click', () => {
                    if (this.currentIndex !== i && !this.animationInProgress) {
                        this.goToSlide(i);
                        this.resetAutoplay();
                    }
                });
                
                dotsContainer.appendChild(dot);
            }
            
            this.dots = dotsContainer.querySelectorAll('.dot');
        },
        
        setupTouchEvents: function() {
            if (!this.container) return;
            
            let touchStartX = 0;
            let touchEndX = 0;
            let touchStartY = 0;
            let touchEndY = 0;
            
            this.container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                this.stopAutoplay();
            }, {passive: true});
            
            this.container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                
                // Calcular la distancia en X e Y
                const deltaX = touchStartX - touchEndX;
                const deltaY = touchStartY - touchEndY;
                
                // Solo considerar como swipe si el movimiento horizontal es mayor que el vertical
                // y si supera un umbral mínimo
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
                
                this.startAutoplay();
            }, {passive: true});
        },
        
        // Nuevo método para control con teclado (accesibilidad)
        setupKeyboardEvents: function() {
            document.addEventListener('keydown', (e) => {
                // Solo responder si el hero slider está en viewport
                const rect = this.container.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
                
                if (!isVisible) return;
                
                if (e.key === 'ArrowRight' || e.key === 'Right') {
                    this.next();
                    this.resetAutoplay();
                } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                    this.prev();
                    this.resetAutoplay();
                }
            });
        },
        
        goToSlide: function(index) {
            if (this.animationInProgress || index === this.currentIndex) return;
            this.animationInProgress = true;
            
            // Ocultar slide actual
            this.slides[this.currentIndex].classList.remove('active');
            
            // Actualizar dots si existen
            if (this.dots && this.dots[this.currentIndex]) {
                this.dots[this.currentIndex].classList.remove('active');
            }
            
            // Actualizar índice
            this.currentIndex = index;
            
            // Mostrar nuevo slide
            this.slides[this.currentIndex].classList.add('active');
            
            // Actualizar dots si existen
            if (this.dots && this.dots[this.currentIndex]) {
                this.dots[this.currentIndex].classList.add('active');
            }
            
            // Permitir nueva animación después de un tiempo
            setTimeout(() => {
                this.animationInProgress = false;
            }, 1200); // Coincidir con la duración de la transición
        },
        
        next: function() {
            const nextIndex = (this.currentIndex + 1) % this.slides.length;
            this.goToSlide(nextIndex);
        },
        
        prev: function() {
            const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prevIndex);
        },
        
        startAutoplay: function() {
            // Limpiar cualquier intervalo existente
            if (this.interval) {
                clearInterval(this.interval);
            }
            
            // Crear nuevo intervalo
            this.interval = setInterval(() => {
                // Solo avanzar si no hay animación en progreso y la página es visible
                if (!this.animationInProgress && !document.hidden) {
                    this.next();
                }
            }, 7000); // 7 segundos entre slides para dar tiempo a leer
        },
        
        resetAutoplay: function() {
            this.stopAutoplay();
            this.startAutoplay();
        },
        
        stopAutoplay: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        },
        
        setupVisibilityChange: function() {
            // Pausar cuando la página no está visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAutoplay();
                } else {
                    this.startAutoplay();
                }
            });
            
            // Reiniciar rotación cuando se enfoca la ventana
            window.addEventListener('focus', () => {
                this.startAutoplay();
            });
            
            // Pausar en hover (desktop)
            this.container.addEventListener('mouseenter', () => {
                this.stopAutoplay();
            });
            
            this.container.addEventListener('mouseleave', () => {
                this.startAutoplay();
            });
        }
    };
    
    // Inicializar el slider
    heroSlider.init();
}
