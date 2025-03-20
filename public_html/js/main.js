/* filepath: /home/xyz/var/www/grtravels.online/public_html/js/main.js */
/**
 * GR Travels - Archivo JavaScript principal
 * Versión optimizada - Marzo 2025
 * Contiene funcionalidades generales del sitio
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('GR Travels - Inicializando funciones principales');
    
    try {
        // Inicializar componentes en orden de prioridad
        initHeader();
        initScrollAnimations();
        initFormValidation();
        initAnalyticsTracking();
        initLazyLoading();
        initMobileMenu();
        handleMobileAppLinks();
        initSmoothScroll();
        
        // Preloader - quitar después de cargar la página
        handlePreloader();
        
        console.log('Inicialización completada');
    } catch (error) {
        console.error('Error en la inicialización:', error);
    }
});

/**
 * Gestionar el preloader de manera más eficiente
 */
function handlePreloader() {
    const preloader = document.querySelector('.page-transition');
    if (!preloader) return;
    
    // Comprobar si todas las imágenes críticas están cargadas
    const criticalImages = Array.from(document.querySelectorAll('.hero img, .logo img'));
    let loadedImages = 0;
    
    const removePreloader = () => {
        preloader.classList.add('loaded');
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 600);
    };
    
    if (criticalImages.length === 0) {
        // Si no hay imágenes críticas, eliminar después de tiempo mínimo
        setTimeout(removePreloader, 500);
    } else {
        // Comprobar si las imágenes ya están en caché
        const allLoaded = criticalImages.every(img => img.complete);
        if (allLoaded) {
            setTimeout(removePreloader, 500);
        } else {
            // Esperar a que se carguen las imágenes críticas
            criticalImages.forEach(img => {
                if (img.complete) {
                    loadedImages++;
                } else {
                    img.addEventListener('load', function() {
                        loadedImages++;
                        if (loadedImages === criticalImages.length) {
                            setTimeout(removePreloader, 500);
                        }
                    });
                    
                    img.addEventListener('error', function() {
                        loadedImages++;
                        console.warn('Error al cargar imagen:', img.src);
                        if (loadedImages === criticalImages.length) {
                            setTimeout(removePreloader, 500);
                        }
                    });
                }
            });
            
            // Timeout de seguridad
            setTimeout(removePreloader, 3000);
        }
    }
}

/**
 * Inicializar funcionalidades del header con rendimiento optimizado
 */
function initHeader() {
    // Toggle del menú móvil con delegación de eventos
    const menuToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (menuToggle && mainNav) {
        // Usar delegación de eventos para mejor rendimiento
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Accesibilidad mejorada
            const expanded = this.classList.contains('active');
            this.setAttribute('aria-expanded', expanded.toString());
            mainNav.setAttribute('aria-hidden', (!expanded).toString());
            
            // Evitar scroll en background cuando menú está abierto
            if (expanded) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
        
        // Inicializar estado de accesibilidad
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
    }
    
    // Header con scroll - throttle para mejor rendimiento
    const header = document.querySelector('.header');
    if (header) {
        let lastScrollTop = 0;
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;
                    
                    if (scrollTop > 100) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    
                    // Header hide on scroll down, show on scroll up
                    if (scrollTop > lastScrollTop && scrollTop > 300) {
                        // Scroll down
                        header.classList.add('header-hidden');
                    } else {
                        // Scroll up
                        header.classList.remove('header-hidden');
                    }
                    
                    lastScrollTop = scrollTop;
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }
    
    // Activar link actual en la navegación
    highlightCurrentNav();
    
    // Cerrar menú móvil al hacer clic en un enlace - delegación de eventos
    const mainNavElement = document.querySelector('.main-nav');
    if (mainNavElement) {
        mainNavElement.addEventListener('click', function(event) {
            const link = event.target.closest('a');
            if (link && menuToggle && menuToggle.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
                body.style.overflow = '';
                
                // Actualizar estados ARIA
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    // Cerrar menú con ESC por accesibilidad
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuToggle && menuToggle.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            
            menuToggle.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');
            menuToggle.focus(); // Devolver el foco al toggle
        }
    });
}

/**
 * Resaltar elemento de navegación actual con detección mejorada
 */
function highlightCurrentNav() {
    // Extraer la ruta de la página actual
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Detectar también secciones con hash
    const currentHash = window.location.hash;
    
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        // Limpiar clases activas
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        
        // Verificar página actual
        if (href === currentPage) {
            link.classList.add('active');
        } else if ((currentPage === 'index.html' || currentPage === '') && 
                  (href === '/' || href === 'index.html' || href === '')) {
            link.classList.add('active');
        } 
        // Verificar hash para navegación en misma página
        else if (currentHash && href === currentHash) {
            link.classList.add('active');
        }
    });
}

/**
 * Inicializar animaciones al hacer scroll con IntersectionObserver
 * para mejor rendimiento
 */
function initScrollAnimations() {
    // Elementos para animar al hacer scroll usando IntersectionObserver
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    const element = entry.target;
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
                    
                    // Dejar de observar elementos ya animados
                    observer.unobserve(element);
                }
            });
        }, options);
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Scrollspy para secciones usando IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const navLink = document.querySelector(`.nav-list a[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    // Remover 'active' de todos los enlaces
                    document.querySelectorAll('.nav-list a').forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Añadir 'active' al enlace correspondiente
                    if (navLink) {
                        navLink.classList.add('active');
                    }
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });
        
        sections.forEach(section => {
            navObserver.observe(section);
        });
    }
    
    // Scroll suave para enlaces internos - delegación de eventos
    document.body.addEventListener('click', function(e) {
        const anchor = e.target.closest('a[href^="#"]:not([href="#"])');
        if (anchor) {
            e.preventDefault();
            
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Actualizar URL con historia para botón atrás
                history.pushState({}, '', targetId);
                
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Establecer el foco en el elemento destino para accesibilidad
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        }
    });
}

/**
 * Inicializar validación de formularios con feedback mejorado
 */
function initFormValidation() {
    // Delegación de eventos para formularios
    document.addEventListener('submit', function(e) {
        const form = e.target;
        
        // Verificar si es un formulario que debemos manejar
        if (form.classList.contains('validate-form') || form.id === 'inquiry-form' || form.id === 'booking-form') {
            e.preventDefault();
            
            if (validateForm(form)) {
                // Simular envío (reemplazar con envío real)
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
                
                // Simulación (reemplazar con fetch real)
                simulateFormSubmission(form, submitBtn, originalText);
            }
        }
    });
    
    // Validación en tiempo real mientras se escribe
    document.addEventListener('input', function(e) {
        const input = e.target;
        const form = input.closest('form');
        
        if (form && (form.classList.contains('validate-form') || form.id === 'inquiry-form' || form.id === 'booking-form')) {
            // Validar el campo específico
            validateSingleField(input);
        }
    });
    
    // Validar al perder el foco
    document.addEventListener('blur', function(e) {
        const input = e.target;
        const form = input.closest('form');
        
        if (form && (form.classList.contains('validate-form') || form.id === 'inquiry-form' || form.id === 'booking-form')) {
            validateSingleField(input);
        }
    }, true);
}

/**
 * Validar un campo individual
 */
function validateSingleField(input) {
    if (!input.tagName || (input.tagName.toLowerCase() !== 'input' && 
                         input.tagName.toLowerCase() !== 'textarea' && 
                         input.tagName.toLowerCase() !== 'select')) {
        return true;
    }
    
    // Eliminar mensaje de error existente
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    input.classList.remove('error');
    input.classList.remove('valid');
    
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones por tipo de campo
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } else if (input.type === 'email' && input.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
            isValid = false;
            errorMessage = 'Por favor ingresa un email válido';
        }
    } else if (input.type === 'tel' && input.value.trim()) {
        // Patrón para teléfonos mexicanos
        const phonePattern = /^(\+52|52)?[\s\-]?[1-9][\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4}$/;
        if (!phonePattern.test(input.value.replace(/\s+/g, ''))) {
            isValid = false;
            errorMessage = 'Por favor ingresa un teléfono válido';
        }
    } else if (input.dataset.minlength && input.value.length < parseInt(input.dataset.minlength)) {
        isValid = false;
        errorMessage = `Debe tener al menos ${input.dataset.minlength} caracteres`;
    }
    
    // Marcar campo como válido o inválido
    if (!isValid) {
        markInvalidField(input, errorMessage);
    } else if (input.value.trim()) {
        input.classList.add('valid');
    }
    
    return isValid;
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
        if (!validateSingleField(input)) {
            valid = false;
        }
    });
    
    // Mostrar un mensaje general si hay errores
    if (!valid) {
        const formMessage = document.createElement('div');
        formMessage.className = 'form-error-message';
        formMessage.textContent = 'Por favor corrige los errores en el formulario';
        
        // Insertar al principio del formulario
        form.prepend(formMessage);
        
        // Eliminar después de un tiempo
        setTimeout(() => {
            formMessage.remove();
        }, 5000);
    }
    
    return valid;
}

/**
 * Simular envío de formulario (reemplazar con fetch real)
 */
function simulateFormSubmission(form, submitBtn, originalText) {
    // Crear spinner de carga
    const spinner = document.createElement('span');
    spinner.className = 'btn-spinner';
    submitBtn.prepend(spinner);
    
    // En un caso real, aquí iría el código para enviar el formulario con fetch
    setTimeout(function() {
        // Eliminar spinner
        spinner.remove();
        
        // Mostrar mensaje de éxito
        showMessage(form, 'success', '¡Gracias por tu mensaje! Te contactaremos pronto.');
        
        // Restablecer formulario y botón
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Quitar clases de validación
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.classList.remove('valid');
            input.classList.remove('error');
        });
        
    }, 1500);
}

/**
 * Marcar campo inválido y mostrar mensaje de error
 */
function markInvalidField(field, message) {
    field.classList.add('error');
    field.classList.remove('valid');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'field-error';
    errorMessage.textContent = message;
    
    // Usar data-error-container si existe
    const errorContainer = field.dataset.errorContainer ? 
        document.querySelector(field.dataset.errorContainer) : field.parentNode;
    
    if (errorContainer) {
        errorContainer.appendChild(errorMessage);
    }
    
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
    
    // Añadir icono para mejor UX
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    messageElement.innerHTML = `<i class="fas ${iconClass}"></i> ${text}`;
    
    // Añadir botón de cierre
    const closeBtn = document.createElement('button');
    closeBtn.className = 'message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Cerrar mensaje');
    closeBtn.addEventListener('click', function() {
        messageElement.classList.add('fade-out');
        setTimeout(function() {
            messageElement.remove();
        }, 500);
    });
    messageElement.appendChild(closeBtn);
    
    // Insertar antes del formulario
    container.parentNode.insertBefore(messageElement, container);
    
    // Eliminar después de un tiempo
    const removeTimeout = setTimeout(function() {
        if (messageElement.isConnected) {
            messageElement.classList.add('fade-out');
            setTimeout(function() {
                if (messageElement.isConnected) {
                    messageElement.remove();
                }
            }, 500);
        }
    }, 6000);
    
    // Guardar el timeout en el elemento para cancelarlo si es necesario
    messageElement.dataset.timeout = removeTimeout;
}

/**
 * Inicializar carga perezosa de imágenes
 */
function initLazyLoading() {
    // Si el navegador soporta lazy loading nativo
    if ('loading' in HTMLImageElement.prototype) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });
    } else {
        // Fallback para navegadores sin soporte nativo
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    
                    // Cargar la imagen
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                    }
                    
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                    }
                    
                    // Dejar de observar después de cargar
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }
    
    // Cargar perezosa de fondos
    const lazyBackgrounds = document.querySelectorAll('[data-background]');
    if (lazyBackgrounds.length) {
        const lazyBackgroundObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.backgroundImage = `url(${entry.target.dataset.background})`;
                    lazyBackgroundObserver.unobserve(entry.target);
                }
            });
        });
        
        lazyBackgrounds.forEach(bg => {
            lazyBackgroundObserver.observe(bg);
        });
    }
}

/**
 * Inicializar seguimiento básico de eventos para Analytics
 */
function initAnalyticsTracking() {
    // Solo si existe alguna función de analytics
    if (typeof gtag === 'function' || typeof ga === 'function' || typeof _paq === 'object') {
        // Seguimiento de clics en CTA
        document.addEventListener('click', function(e) {
            const element = e.target;
            
            // Botones de reserva
            if (element.closest('.btn-primary') && 
                (element.textContent.includes('Reservar') || 
                 element.closest('.btn-primary').textContent.includes('Reservar'))) {
                trackEvent('CTA', 'click', 'Reservar');
            }
            
            // Enlaces a teléfonos
            if (element.closest('a[href^="tel:"]')) {
                trackEvent('Contact', 'click', 'Phone');
            }
            
            // Enlaces a WhatsApp
            if (element.closest('a[href*="whatsapp"]')) {
                trackEvent('Contact', 'click', 'WhatsApp');
            }
            
            // Enlaces a destinos
            if (element.closest('.destination-card a')) {
                const destino = element.closest('.destination-card')?.querySelector('h3')?.textContent || 'Destino';
                trackEvent('Destination', 'click', destino);
            }
        });
        
        // Seguimiento de envíos de formularios
        document.addEventListener('submit', function(e) {
            if (e.target.id === 'inquiry-form') {
                trackEvent('Form', 'submit', 'Inquiry');
            } else if (e.target.id === 'booking-form') {
                trackEvent('Form', 'submit', 'Booking');
            }
        });
    }
}

/**
 * Función genérica para seguimiento de eventos
 */
function trackEvent(category, action, label, value) {
    // Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    } else if (typeof ga === 'function') {
        ga('send', 'event', category, action, label, value);
    }
    
    // Matomo/Piwik
    if (typeof _paq === 'object') {
        _paq.push(['trackEvent', category, action, label, value]);
    }
    
    // Registrar en la consola para depuración
    console.log(`Evento registrado: ${category} - ${action} - ${label}`);
}

/**
 * Inicializar menú móvil con navegación en la misma página
 */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (!mobileToggle || !mainNav) {
        console.warn('Elementos del menú móvil no encontrados');
        return;
    }
    
    // Limpiar cualquier event listener anterior
    const toggleClone = mobileToggle.cloneNode(true);
    mobileToggle.parentNode.replaceChild(toggleClone, mobileToggle);
    
    // Añadir nuevo event listener
    toggleClone.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        // Controlar overflow del body de manera segura
        if (this.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
        
        // Accesibilidad
        const expanded = this.classList.contains('active');
        this.setAttribute('aria-expanded', expanded.toString());
        mainNav.setAttribute('aria-hidden', (!expanded).toString());
        
        console.log('Toggle menu clicked, active:', expanded);
    });
    
    // Cerrar menú al hacer clic en enlaces
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                toggleClone.classList.remove('active');
                mainNav.classList.remove('active');
                body.style.overflow = '';
                
                // Actualizar atributos ARIA
                toggleClone.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');
            }
        });
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && 
            toggleClone.classList.contains('active') && 
            !mainNav.contains(e.target) && 
            !toggleClone.contains(e.target)) {
            
            toggleClone.classList.remove('active');
            mainNav.classList.remove('active');
            body.style.overflow = '';
            
            // Actualizar atributos ARIA
            toggleClone.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');
        }
    });
}

/**
 * Maneja los enlaces a aplicaciones nativas móviles
 */
function handleMobileAppLinks() {
    // Manejar enlace de Facebook
    const fbLink = document.getElementById('facebook-link');
    if (fbLink) {
        fbLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const fbPageName = 'garovtatours';
            const fbPageId = ''; // Añadir ID numérico si se conoce
            
            // Detectar sistema operativo
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            
            // Enlaces para diferentes plataformas
            let fbUrl = `https://www.facebook.com/${fbPageName}`;
            
            // Intentar usar aplicación nativa en iOS o Android
            if (/android/i.test(userAgent)) {
                // Android: intentar con la aplicación, con fallback a la web
                if (fbPageId) {
                    fbUrl = `fb://page/${fbPageId}`;
                } else {
                    fbUrl = `fb://facewebmodal/f?href=https://www.facebook.com/${fbPageName}`;
                }
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                // iOS: intentar con la aplicación, con fallback a la web
                if (fbPageId) {
                    fbUrl = `fb://page/?id=${fbPageId}`;
                } else {
                    fbUrl = `fb://profile/${fbPageName}`;
                }
            }
            
            // Abrir en nueva ventana/pestaña
            window.open(fbUrl, '_blank');
        });
    }
}

/**
 * Implementar scroll suave para navegación interna
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Obtener el destino sin el #
            const targetId = this.getAttribute('href').substring(1);
            
            // Solo procesar si el ID existe en la página
            if (targetId && document.getElementById(targetId)) {
                const targetElement = document.getElementById(targetId);
                
                // Calcular offset para tener en cuenta el header fijo
                const headerOffset = 80; // Ajustar según la altura del header
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