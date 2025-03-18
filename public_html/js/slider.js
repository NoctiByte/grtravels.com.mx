/* filepath: /home/xyz/var/www/grtravels.online/public_html/js/slider.js */
/**
 * GR Travels - Funcionalidad del slider
 */

document.addEventListener('DOMContentLoaded', function() {
    initHeroSlider();
});

function initHeroSlider() {
    const heroSlider = {
        container: document.querySelector('.hero-slider'),
        slides: document.querySelectorAll('.hero-slider .slide'),
        dots: document.querySelectorAll('.slider-nav .dot'),
        prevBtn: document.querySelector('.slider-nav .prev'),
        nextBtn: document.querySelector('.slider-nav .next'),
        currentIndex: 0,
        interval: null,
        animationInProgress: false,
        
        init: function() {
            if (!this.container || this.slides.length <= 1) return;
            
            this.setupInitialState();
            this.setupNavigation();
            this.setupTouchEvents();
            this.startAutoplay();
            this.setupVisibilityChange();
            
            // Si no hay botones de navegación, crearlos
            if (!this.prevBtn || !this.nextBtn) {
                this.createNavButtons();
            }
        },
        
        setupInitialState: function() {
            // Activar el primer slide
            this.slides[0].classList.add('active');
            
            // Activar el primer dot si existe
            if (this.dots && this.dots.length > 0) {
                this.dots[0].classList.add('active');
            }
        },
        
        setupNavigation: function() {
            // Configurar botones prev/next si existen
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.stopAutoplay();
                    this.navigate('prev');
                    this.startAutoplay();
                });
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.stopAutoplay();
                    this.navigate('next');
                    this.startAutoplay();
                });
            }
            
            // Configurar dots si existen
            if (this.dots && this.dots.length > 0) {
                this.dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        if (this.currentIndex !== index) {
                            this.stopAutoplay();
                            this.goToSlide(index);
                            this.startAutoplay();
                        }
                    });
                });
            }
        },
        
        setupTouchEvents: function() {
            let touchStartX = 0;
            let touchEndX = 0;
            
            this.container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                this.stopAutoplay();
            }, {passive: true});
            
            this.container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                
                if (touchStartX - touchEndX > 50) {
                    this.navigate('next');
                } else if (touchEndX - touchStartX > 50) {
                    this.navigate('prev');
                }
                
                this.startAutoplay();
            }, {passive: true});
        },
        
        navigate: function(direction) {
            if (this.animationInProgress || this.slides.length <= 1) return;
            
            this.animationInProgress = true;
            
            // Ocultar slide actual
            this.slides[this.currentIndex].classList.remove('active');
            if (this.dots && this.dots.length > 0) {
                this.dots[this.currentIndex].classList.remove('active');
            }
            
            // Calcular nuevo índice
            if (direction === 'next') {
                this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            } else {
                this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
            }
            
            // Mostrar nuevo slide
            this.slides[this.currentIndex].classList.add('active');
            if (this.dots && this.dots.length > 0) {
                this.dots[this.currentIndex].classList.add('active');
            }
            
            // Permitir nueva animación después de un tiempo
            setTimeout(() => {
                this.animationInProgress = false;
            }, 800); // Duración de la transición
        },
        
        goToSlide: function(index) {
            if (this.animationInProgress || index === this.currentIndex || index >= this.slides.length) return;
            
            this.animationInProgress = true;
            
            // Ocultar slide actual
            this.slides[this.currentIndex].classList.remove('active');
            if (this.dots && this.dots.length > 0) {
                this.dots[this.currentIndex].classList.remove('active');
            }
            
            // Ir al slide seleccionado
            this.currentIndex = index;
            
            // Mostrar nuevo slide
            this.slides[this.currentIndex].classList.add('active');
            if (this.dots && this.dots.length > 0) {
                this.dots[this.currentIndex].classList.add('active');
            }
            
            // Permitir nueva animación después de un tiempo
            setTimeout(() => {
                this.animationInProgress = false;
            }, 800);
        },
        
        startAutoplay: function() {
            // Limpiar intervalo anterior si existe
            if (this.interval) {
                clearInterval(this.interval);
            }
            
            // Crear nuevo intervalo
            this.interval = setInterval(() => {
                // Solo avanzar si la página está visible y no hay animación en progreso
                if (!this.animationInProgress && !document.hidden) {
                    this.navigate('next');
                }
            }, 5000); // Cambiar cada 5 segundos
        },
        
        stopAutoplay: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        },
        
        createNavButtons: function() {
            // Crear contenedor de navegación
            const sliderNav = document.createElement('div');
            sliderNav.className = 'slider-nav';
            
            // Crear botón anterior
            const prevBtn = document.createElement('button');
            prevBtn.className = 'prev';
            prevBtn.setAttribute('aria-label', 'Slide anterior');
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            
            // Crear botón siguiente
            const nextBtn = document.createElement('button');
            nextBtn.className = 'next';
            nextBtn.setAttribute('aria-label', 'Slide siguiente');
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            
            // Crear contenedor para dots
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'dots';
            
            // Crear dots según cantidad de slides
            for (let i = 0; i < this.slides.length; i++) {
                const dot = document.createElement('button');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.setAttribute('aria-label', `Ir al slide ${i+1}`);
                dotsContainer.appendChild(dot);
            }
            
            // Añadir elementos al DOM
            sliderNav.appendChild(prevBtn);
            sliderNav.appendChild(dotsContainer);
            sliderNav.appendChild(nextBtn);
            this.container.appendChild(sliderNav);
            
            // Actualizar referencias
            this.prevBtn = prevBtn;
            this.nextBtn = nextBtn;
            this.dots = dotsContainer.querySelectorAll('.dot');
            
            // Configurar eventos
            this.setupNavigation();
        },
        
        // Importante: Manejar cambios de visibilidad de la página
        setupVisibilityChange: function() {
            // Cuando la página se vuelve visible/invisible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // La página está oculta, pausar autoplay
                    this.stopAutoplay();
                } else {
                    // La página está visible, reanudar autoplay
                    this.startAutoplay();
                }
            });
            
            // Asegurarse de reanudar el autoplay cuando el dispositivo se activa
            window.addEventListener('focus', () => {
                this.startAutoplay();
            });
            
            // Para dispositivos móviles, reiniciar cuando hay interacción
            this.container.addEventListener('touchstart', () => {
                if (!this.interval) {
                    this.startAutoplay();
                }
            }, {passive: true});
        }
    };
    
    // Inicializar el slider
    heroSlider.init();
}