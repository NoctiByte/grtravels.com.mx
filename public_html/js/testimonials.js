/**
 * GR Travels - Testimonials Slider Controller
 * Versión optimizada y corregida - Agosto 2026
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando testimonials.js');
    initTestimonialsSlider();
});

function initTestimonialsSlider() {
    console.log('Iniciando configuración de testimonios');
    
    // Seleccionar elementos
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const container = document.querySelector('.testimonials-container');
    
    // Verificar elementos
    if (!container || testimonialItems.length === 0) {
        console.warn('Testimonials Slider: No se encontraron elementos necesarios');
        return;
    }
    
    console.log(`Encontrados ${testimonialItems.length} testimonios`);
    
    // Verificación adicional para íconos
    const quoteIcons = document.querySelectorAll('.testimonial-body .quote-icon');
    console.log('Íconos de comillas encontrados:', quoteIcons.length);
    
    const serviceIcons = document.querySelectorAll('.testimonial-service .service-icon');
    console.log('Íconos de servicios encontrados:', serviceIcons.length);
    
    // Variables de control
    let currentIndex = 0;
    let isAnimating = false;
    let autoplayInterval = null;
    const animationDuration = 500; // ms - duración de la transición
    
    // Asegurarse de que al menos un testimonio esté activo
    if (!document.querySelector('.testimonial-item.active')) {
        console.log('Activando primer testimonio');
        testimonialItems[0].classList.add('active');
        testimonialItems[0].style.opacity = '1';
    } else {
        // Si ya hay uno activo, actualizamos el índice actual
        testimonialItems.forEach((item, index) => {
            if (item.classList.contains('active')) {
                currentIndex = index;
                console.log(`Testimonio activo encontrado en posición ${index + 1}`);
            }
        });
    }
    
    // Inicializar componentes
    createIndicators();
    setupNavigationButtons();
    setupTouchEvents();
    startAutoplay();
    setupHoverEvents();
    
    /**
     * Crea los indicadores para navegación entre testimonios
     */
    function createIndicators() {
        const indicatorsContainer = container.querySelector('.testimonial-indicators');
        if (!indicatorsContainer) {
            console.warn('No se encontró contenedor para indicadores');
            return;
        }
        
        // Limpiar contenedor
        indicatorsContainer.innerHTML = '';
        
        // Crear un indicador por cada testimonio
        testimonialItems.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = index === currentIndex ? 'testimonial-indicator active' : 'testimonial-indicator';
            indicator.setAttribute('aria-label', `Ver testimonio ${index + 1}`);
            indicator.setAttribute('data-index', index.toString());
            
            indicator.addEventListener('click', function() {
                if (isAnimating) return;
                
                const targetIndex = parseInt(this.getAttribute('data-index') || '0');
                if (currentIndex !== targetIndex) {
                    goToSlide(targetIndex);
                    resetAutoplay();
                }
            });
            
            indicatorsContainer.appendChild(indicator);
        });
        
        console.log('Indicadores creados correctamente');
    }
    
    /**
     * Configura los botones de flechas para navegación
     */
    function setupNavigationButtons() {
        const prevBtn = container.querySelector('.testimonial-arrow.prev');
        const nextBtn = container.querySelector('.testimonial-arrow.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (!isAnimating) {
                    goToPrev();
                    resetAutoplay();
                }
            });
        } else {
            console.warn('Botón "anterior" no encontrado');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (!isAnimating) {
                    goToNext();
                    resetAutoplay();
                }
            });
        } else {
            console.warn('Botón "siguiente" no encontrado');
        }
        
        console.log('Botones de navegación configurados');
    }
    
    /**
     * Navega a un testimonio específico
     */
    function goToSlide(index) {
        if (isAnimating || index === currentIndex || index < 0 || index >= testimonialItems.length) return;
        
        isAnimating = true;
        console.log(`Navegando al testimonio ${index + 1}`);
        
        // Ocultar testimonio actual
        const currentSlide = testimonialItems[currentIndex];
        if (currentSlide) {
            currentSlide.style.opacity = '0';
            
            setTimeout(() => {
                currentSlide.classList.remove('active');
                
                // Actualizar índice
                currentIndex = index;
                
                // Mostrar nuevo testimonio
                const nextSlide = testimonialItems[currentIndex];
                if (nextSlide) {
                    nextSlide.classList.add('active');
                    
                    // Forzar repintado del DOM antes de cambiar opacidad
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            nextSlide.style.opacity = '1';
                            updateIndicators();
                            
                            // Permitir nueva animación después de la duración de la transición
                            setTimeout(() => {
                                isAnimating = false;
                            }, animationDuration);
                        });
                    });
                } else {
                    console.warn(`Error: El testimonio ${index + 1} no existe`);
                    isAnimating = false;
                }
            }, animationDuration);
        } else {
            console.warn('Error: No se pudo encontrar el testimonio actual');
            isAnimating = false;
        }
    }
    
    /**
     * Navega al siguiente testimonio
     */
    function goToNext() {
        const nextIndex = (currentIndex + 1) % testimonialItems.length;
        goToSlide(nextIndex);
    }
    
    /**
     * Navega al testimonio anterior
     */
    function goToPrev() {
        const prevIndex = (currentIndex - 1 + testimonialItems.length) % testimonialItems.length;
        goToSlide(prevIndex);
    }
    
    /**
     * Actualiza el estado activo de los indicadores
     */
    function updateIndicators() {
        const indicators = container.querySelectorAll('.testimonial-indicator');
        indicators.forEach((indicator, i) => {
            if (i === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    /**
     * Inicia la rotación automática de testimonios
     */
    function startAutoplay() {
        stopAutoplay(); // Evitar múltiples intervalos
        
        autoplayInterval = setInterval(() => {
            if (!document.hidden && !isAnimating) {
                goToNext();
            }
        }, 6000); // 6 segundos entre testimonios
        
        console.log('Autoplay iniciado');
    }
    
    /**
     * Detiene la rotación automática
     */
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    /**
     * Reinicia la rotación automática
     */
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }
    
    /**
     * Configura eventos táctiles para deslizamiento en dispositivos móviles
     */
    function setupTouchEvents() {
        if (!container) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            stopAutoplay();
        }, { passive: true });
        
        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            // Calcular distancias
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            // Solo considerar como swipe si el movimiento horizontal es mayor que el vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    goToNext();
                } else {
                    goToPrev();
                }
            }
            
            startAutoplay();
        }, { passive: true });
        
        console.log('Eventos táctiles configurados');
    }
    
    /**
     * Configura eventos de hover y visibilidad
     */
    function setupHoverEvents() {
        container.addEventListener('mouseenter', () => {
            stopAutoplay();
        });
        
        container.addEventListener('mouseleave', () => {
            startAutoplay();
        });
        
        // Visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });
        
        // Accesibilidad con teclado
        container.setAttribute('tabindex', '0');
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                if (!isAnimating) {
                    goToNext();
                    resetAutoplay();
                }
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                if (!isAnimating) {
                    goToPrev();
                    resetAutoplay();
                }
                e.preventDefault();
            }
        });
        
        console.log('Eventos de hover y accesibilidad configurados');
    }
    
    // Notificar que todo se ha inicializado correctamente
    console.log('Slider de testimonios inicializado correctamente');
}
