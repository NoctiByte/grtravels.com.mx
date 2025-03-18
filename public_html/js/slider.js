/* filepath: /home/xyz/var/www/grtravels.online/public_html/js/slider.js */
/**
 * GR Travels - Funcionalidad del slider
 */

document.addEventListener('DOMContentLoaded', function() {
    initHeroSlider();
    // Otras inicializaciones...
    initTestimonialsSlider();
});

function initHeroSlider() {
    const heroSlider = {
        container: document.querySelector('.hero-slider'),
        slides: document.querySelectorAll('.hero-slider .slide'),
        currentIndex: 0,
        interval: null,
        animationInProgress: false,
        
        init: function() {
            if (!this.container || this.slides.length <= 1) return;
            
            // Activar el primer slide
            this.slides[0].classList.add('active');
            
            // Crear los dots de navegación
            this.createDots();
            
            // Configurar eventos táctiles
            this.setupTouchEvents();
            
            // Iniciar rotación automática
            this.startAutoplay();
            
            // Manejar cambios de visibilidad
            this.setupVisibilityChange();
        },
        
        createDots: function() {
            const dotsContainer = document.querySelector('.hero-slider .dots');
            if (!dotsContainer) return;
            
            // Limpiar contenedor si ya tiene dots
            dotsContainer.innerHTML = '';
            
            // Crear un dot por cada slide
            for (let i = 0; i < this.slides.length; i++) {
                const dot = document.createElement('button');
                dot.className = i === 0 ? 'dot active' : 'dot';
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
        
        goToSlide: function(index) {
            if (this.animationInProgress) return;
            this.animationInProgress = true;
            
            // Ocultar slide actual
            this.slides[this.currentIndex].classList.remove('active');
            this.dots[this.currentIndex].classList.remove('active');
            
            // Actualizar índice
            this.currentIndex = index;
            
            // Mostrar nuevo slide
            this.slides[this.currentIndex].classList.add('active');
            this.dots[this.currentIndex].classList.add('active');
            
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
            if (this.interval) {
                clearInterval(this.interval);
            }
            
            this.interval = setInterval(() => {
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
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAutoplay();
                } else {
                    this.startAutoplay();
                }
            });
            
            window.addEventListener('focus', () => {
                this.startAutoplay();
            });
        }
    };
    
    // Inicializar el slider
    heroSlider.init();
}

/**
 * Inicializar slider de testimonios
 */
function initTestimonialsSlider() {
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const testimonialsContainer = document.querySelector('.testimonials-slider');
    
    if (testimonialItems.length <= 1 || !testimonialsContainer) return;
    
    // Muestra el primer testimonio
    testimonialItems[0].classList.add('active');
    
    let currentIndex = 0;
    let interval;
    let isAnimating = false;
    
    // Crear controles de navegación
    const navigation = document.createElement('div');
    navigation.className = 'testimonial-nav';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'testimonial-prev';
    prevBtn.setAttribute('aria-label', 'Testimonio anterior');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'testimonial-next';
    nextBtn.setAttribute('aria-label', 'Testimonio siguiente');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    const indicators = document.createElement('div');
    indicators.className = 'testimonial-indicators';
    
    testimonialItems.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = index === 0 ? 'indicator active' : 'indicator';
        indicators.appendChild(dot);
    });
    
    navigation.appendChild(prevBtn);
    navigation.appendChild(indicators);
    navigation.appendChild(nextBtn);
    
    testimonialsContainer.appendChild(navigation);
    
    // Función para cambiar testimonios
    function showTestimonial(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        testimonialItems[currentIndex].classList.remove('active');
        document.querySelectorAll('.testimonial-indicators .indicator')[currentIndex].classList.remove('active');
        
        currentIndex = index;
        
        testimonialItems[currentIndex].classList.add('active');
        document.querySelectorAll('.testimonial-indicators .indicator')[currentIndex].classList.add('active');
        
        setTimeout(() => {
            isAnimating = false;
        }, 800);
    }
    
    // Navegación con botones
    prevBtn.addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + testimonialItems.length) % testimonialItems.length;
        showTestimonial(prevIndex);
        resetInterval();
    });
    
    nextBtn.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % testimonialItems.length;
        showTestimonial(nextIndex);
        resetInterval();
    });
    
    // Navegación con indicadores
    document.querySelectorAll('.testimonial-indicators .indicator').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (currentIndex !== index) {
                showTestimonial(index);
                resetInterval();
            }
        });
    });
    
    // Rotación automática
    function startInterval() {
        interval = setInterval(() => {
            if (!document.hidden) {
                const nextIndex = (currentIndex + 1) % testimonialItems.length;
                showTestimonial(nextIndex);
            }
        }, 6000); // Cambiar cada 6 segundos
    }
    
    function resetInterval() {
        clearInterval(interval);
        startInterval();
    }
    
    // Iniciar rotación automática
    startInterval();
    
    // Pausar al interactuar
    testimonialsContainer.addEventListener('mouseenter', () => {
        clearInterval(interval);
    });
    
    testimonialsContainer.addEventListener('mouseleave', () => {
        startInterval();
    });
    
    // Manejar visibilidad de página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(interval);
        } else {
            startInterval();
        }
    });
}