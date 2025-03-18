/* filepath: /home/xyz/var/www/grtravels.online/public_html/js/main.js */
/**
 * GR Travels - Archivo JavaScript principal
 * Contiene funcionalidades generales del sitio
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initHeader();
    initScrollAnimations();
    initFormValidation();
    
    // Preloader - quitar después de cargar la página
    setTimeout(function() {
        const preloader = document.querySelector('.page-transition');
        if (preloader) {
            preloader.classList.add('loaded');
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 600);
        }
    }, 800);
});

/**
 * Inicializar funcionalidades del header
 */
function initHeader() {
    // Toggle del menú móvil
    const menuToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }
    
    // Header con scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Activar link actual en la navegación
    highlightCurrentNav();
    
    // Cerrar menú móvil al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (menuToggle && menuToggle.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    });
}

/**
 * Resaltar elemento de navegación actual
 */
function highlightCurrentNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === 'index.html' && (href === '/' || href === 'index.html' || href === '')) {
            link.classList.add('active');
        }
    });
}

/**
 * Inicializar animaciones al hacer scroll
 */
function initScrollAnimations() {
    // Elementos para animar al hacer scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        // Verificar si un elemento está en el viewport
        const isElementInViewport = function(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
                rect.bottom >= 0
            );
        };
        
        // Animar elementos visibles
        const animateElements = function() {
            animatedElements.forEach(element => {
                if (isElementInViewport(element) && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                    
                    // Añadir clase de animación según atributo data
                    if (element.dataset.animation) {
                        element.classList.add(element.dataset.animation);
                    } else {
                        element.classList.add('animate-fade-up');
                    }
                    
                    // Añadir delay si existe
                    if (element.dataset.delay) {
                        element.style.animationDelay = element.dataset.delay;
                    }
                }
            });
        };
        
        // Ejecutar en carga y scroll
        animateElements();
        window.addEventListener('scroll', animateElements);
    }
    
    // Scrollspy para secciones
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        window.addEventListener('scroll', function() {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    document.querySelector('.nav-list a[href*=' + id + ']')?.classList.add('active');
                } else {
                    document.querySelector('.nav-list a[href*=' + id + ']')?.classList.remove('active');
                }
            });
        });
    }
    
    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Inicializar validación de formularios
 */
function initFormValidation() {
    // Formulario de contacto
    const contactForm = document.getElementById('inquiry-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(contactForm)) {
                // Simular envío (reemplazar con envío real)
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
                
                // Simulación (reemplazar con fetch o AJAX)
                setTimeout(function() {
                    showMessage(contactForm, 'success', '¡Gracias por tu mensaje! Te contactaremos pronto.');
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 1500);
            }
        });
    }
}

/**
 * Validar campos de un formulario
 */
function validateForm(form) {
    let valid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Eliminar mensajes previos
    const errorMessages = form.querySelectorAll('.field-error');
    errorMessages.forEach(error => error.remove());
    
    // Validar cada campo
    inputs.forEach(input => {
        input.classList.remove('error');
        
        if (input.hasAttribute('required') && !input.value.trim()) {
            markInvalidField(input, 'Este campo es obligatorio');
            valid = false;
        } else if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                markInvalidField(input, 'Por favor ingresa un email válido');
                valid = false;
            }
        } else if (input.type === 'tel' && input.value.trim()) {
            const phonePattern = /^[0-9\s\(\)\+\-]{7,15}$/;
            if (!phonePattern.test(input.value)) {
                markInvalidField(input, 'Por favor ingresa un teléfono válido');
                valid = false;
            }
        }
    });
    
    return valid;
}

/**
 * Marcar campo inválido y mostrar mensaje de error
 */
function markInvalidField(field, message) {
    field.classList.add('error');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'field-error';
    errorMessage.textContent = message;
    
    field.parentNode.appendChild(errorMessage);
    
    // Enfocar primer campo con error
    if (document.querySelectorAll('.field-error').length === 1) {
        field.focus();
    }
}

/**
 * Mostrar mensaje de éxito o error
 */
function showMessage(container, type, text) {
    // Eliminar mensajes previos
    const existingMessages = container.parentNode.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageElement = document.createElement('div');
    messageElement.className = type === 'success' ? 'success-message' : 'error-message';
    messageElement.textContent = text;
    
    // Insertar antes del formulario
    container.parentNode.insertBefore(messageElement, container);
    
    // Eliminar después de un tiempo
    setTimeout(function() {
        messageElement.classList.add('fade-out');
        setTimeout(function() {
            messageElement.remove();
        }, 500);
    }, 5000);
}