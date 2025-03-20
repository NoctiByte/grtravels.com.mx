/* filepath: /home/xyz/var/www/grtravels.online/public_html/js/booking.js */
/**
 * GR Travels - Sistema de Reservaciones
 * Maneja formularios de reserva y consultas rápidas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes del sistema de reservas
    initBookingForms();
    initDatePickers();
    initPassengerCounters();
    initInquiryForm();
    setupFormValidation();
    
    // Vincular a evento submit de los formularios
    const forms = document.querySelectorAll('.contact-form form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
});

/**
 * Inicializar formularios de reservas
 */
function initBookingForms() {
    const bookingForm = document.getElementById('booking-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(bookingForm)) {
                processBookingForm(bookingForm);
            }
        });
        
        // Actualizaciones dinámicas según el servicio seleccionado
        const serviceSelect = bookingForm.querySelector('#service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', function() {
                updateFormFieldsByService(this.value);
            });
            
            // Inicializar con el valor actual
            if (serviceSelect.value) {
                updateFormFieldsByService(serviceSelect.value);
            }
        }
    }
}

/**
 * Actualizar campos del formulario según el servicio seleccionado
 */
function updateFormFieldsByService(serviceType) {
    const destinationField = document.getElementById('destination-group');
    const returnDateField = document.getElementById('return-date-group');
    const additionalInfoField = document.getElementById('additional-info');
    
    if (!destinationField && !returnDateField && !additionalInfoField) return;
    
    // Restablecer mensajes de ayuda
    const helpText = document.getElementById('service-help-text');
    
    switch (serviceType) {
        case 'airport':
            if (destinationField) destinationField.style.display = 'block';
            if (returnDateField) returnDateField.style.display = 'none';
            if (additionalInfoField) additionalInfoField.placeholder = 'Información de vuelo, hotel de destino...';
            if (helpText) helpText.textContent = 'Por favor indique si necesita traslado de llegada, salida o ambos.';
            break;
            
        case 'tour':
            if (destinationField) destinationField.style.display = 'block';
            if (returnDateField) returnDateField.style.display = 'none';
            if (additionalInfoField) additionalInfoField.placeholder = 'Preferencias, restricciones dietéticas, necesidades especiales...';
            if (helpText) helpText.textContent = 'Tours guiados a los mejores destinos de la Bahía de Banderas.';
            break;
            
        case 'event':
            if (destinationField) destinationField.style.display = 'block';
            if (returnDateField) returnDateField.style.display = 'block';
            if (additionalInfoField) additionalInfoField.placeholder = 'Tipo de evento, servicios adicionales requeridos...';
            if (helpText) helpText.textContent = 'Transporte para bodas, conferencias y eventos grupales.';
            break;
            
        case 'custom':
            if (destinationField) destinationField.style.display = 'block';
            if (returnDateField) returnDateField.style.display = 'block';
            if (additionalInfoField) additionalInfoField.placeholder = 'Describa su itinerario deseado, lugares a visitar...';
            if (helpText) helpText.textContent = 'Diseñamos viajes personalizados según sus preferencias.';
            break;
            
        default:
            if (destinationField) destinationField.style.display = 'none';
            if (returnDateField) returnDateField.style.display = 'none';
            if (helpText) helpText.textContent = '';
    }
}

/**
 * Inicializar selectores de fecha
 */
function initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        input.min = today;
        
        // Si es un campo de fecha de regreso, actualizar cuando cambie la fecha de ida
        if (input.id === 'return-date') {
            const departureDate = document.getElementById('date');
            if (departureDate) {
                departureDate.addEventListener('change', function() {
                    input.min = this.value;
                    
                    // Si la fecha de regreso es anterior a la nueva fecha de ida, actualizarla
                    if (input.value && input.value < this.value) {
                        input.value = this.value;
                    }
                });
            }
        }
    });
}

/**
 * Inicializar contadores de pasajeros
 */
function initPassengerCounters() {
    const passengerInput = document.getElementById('passengers');
    if (!passengerInput) return;
    
    // Crear interfaz de contador
    const counterWrapper = document.createElement('div');
    counterWrapper.className = 'passenger-counter';
    
    const decrementBtn = document.createElement('button');
    decrementBtn.type = 'button';
    decrementBtn.className = 'counter-btn decrement';
    decrementBtn.textContent = '-';
    decrementBtn.setAttribute('aria-label', 'Disminuir pasajeros');
    
    const incrementBtn = document.createElement('button');
    incrementBtn.type = 'button';
    incrementBtn.className = 'counter-btn increment';
    incrementBtn.textContent = '+';
    incrementBtn.setAttribute('aria-label', 'Aumentar pasajeros');
    
    // Insertar antes del input
    passengerInput.parentNode.insertBefore(decrementBtn, passengerInput);
    passengerInput.parentNode.insertBefore(incrementBtn, passengerInput.nextSibling);
    
    // Valor mínimo
    passengerInput.min = 1;
    if (!passengerInput.value) {
        passengerInput.value = 1;
    }
    
    // Eventos
    decrementBtn.addEventListener('click', function() {
        let value = parseInt(passengerInput.value) || 1;
        if (value > 1) {
            passengerInput.value = value - 1;
            passengerInput.dispatchEvent(new Event('change'));
        }
        updateButtonState();
    });
    
    incrementBtn.addEventListener('click', function() {
        let value = parseInt(passengerInput.value) || 1;
        passengerInput.value = value + 1;
        passengerInput.dispatchEvent(new Event('change'));
        updateButtonState();
    });
    
    passengerInput.addEventListener('change', updateButtonState);
    passengerInput.addEventListener('input', function() {
        // Asegurar que sea un número válido
        let value = parseInt(this.value) || 1;
        if (value < 1) value = 1;
        this.value = value;
        updateButtonState();
    });
    
    function updateButtonState() {
        let value = parseInt(passengerInput.value) || 1;
        decrementBtn.disabled = value <= 1;
        
        // Actualizar precio si existe un campo de precio
        updatePrice(value);
    }
    
    // Actualizar estado inicial
    updateButtonState();
}

/**
 * Actualizar precios si hay un elemento de precio en la página
 */
function updatePrice(passengers) {
    const priceElement = document.getElementById('tour-price');
    const basePriceElement = document.getElementById('base-price');
    
    if (priceElement && basePriceElement) {
        const basePrice = parseFloat(basePriceElement.dataset.price) || 0;
        const totalPrice = basePrice * passengers;
        
        priceElement.textContent = totalPrice.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        });
    }
}

/**
 * Inicializar formulario de consulta rápida
 */
function initInquiryForm() {
    const inquiryForm = document.getElementById('inquiry-form');
    
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', function(e) {
            // Solo validamos, pero permitimos el envío real al servidor de Formspree
            if (!validateForm(inquiryForm)) {
                e.preventDefault(); // Detener envío solo si hay errores
                return false;
            }
            
            // Si la validación es exitosa, mostrar indicador de carga
            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
            
            // El formulario se enviará a Formspree automáticamente
            // No necesitamos preventDefault() para que se realice el envío
        });
    }
}

/**
 * Configurar validación de formularios
 */
function setupFormValidation() {
    // Añadir validación en tiempo real a todos los campos requeridos
    const requiredFields = document.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            // Si el campo tenía un error, validar mientras se escribe
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
    
    // Validación de email
    const emailFields = document.querySelectorAll('input[type="email"]');
    
    emailFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                showError(this, 'Por favor ingresa un email válido');
            } else if (this.required && !this.value) {
                showError(this, 'Este campo es obligatorio');
            } else {
                clearError(this);
            }
        });
    });
}

/**
 * Validar un campo individual
 */
function validateField(field) {
    // Comprobar si el campo está vacío y es requerido
    if (field.required && !field.value.trim()) {
        showError(field, 'Este campo es obligatorio');
        return false;
    }
    
    // Validación según tipo de campo
    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        showError(field, 'Por favor ingresa un email válido');
        return false;
    }
    
    if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
        showError(field, 'Por favor ingresa un teléfono válido');
        return false;
    }
    
    if (field.type === 'date' && field.value) {
        const selectedDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError(field, 'La fecha no puede ser en el pasado');
            return false;
        }
    }
    
    if (field.id === 'passengers' && parseInt(field.value) < 1) {
        showError(field, 'Debe haber al menos 1 pasajero');
        return false;
    }
    
    // Si pasa todas las validaciones, limpiar error
    clearError(field);
    return true;
}

/**
 * Validar un formulario completo
 */
function validateForm(form) {
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;
    
    // Eliminar errores previos
    form.querySelectorAll('.has-error').forEach(field => {
        field.classList.remove('has-error');
    });
    
    form.querySelectorAll('.error-message').forEach(msg => {
        msg.remove();
    });
    
    // Validar cada campo
    fields.forEach(field => {
        const fieldContainer = field.closest('.form-group');
        
        if (!field.value.trim()) {
            valid = false;
            fieldContainer.classList.add('has-error');
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Este campo es obligatorio';
            fieldContainer.appendChild(errorMessage);
        }
        
        // Validación específica para email
        if (field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                valid = false;
                fieldContainer.classList.add('has-error');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Ingrese un email válido';
                fieldContainer.appendChild(errorMessage);
            }
        }
    });
    
    return valid;
}

/**
 * Procesar el formulario de reserva
 */
function processBookingForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Cambiar estado del botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Procesando...';
    
    // Recolectar datos del formulario
    const formData = new FormData(form);
    
    // Simulación de envío (reemplazar con AJAX real)
    setTimeout(() => {
        // Simular respuesta exitosa
        showSuccessMessage('¡Tu reserva ha sido recibida correctamente! Te contactaremos pronto para confirmar los detalles.');
        
        // Limpiar formulario
        form.reset();
        
        // Restablecer botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Redireccionar después de unos segundos
        setTimeout(() => {
            if (document.getElementById('booking-confirmation')) {
                window.location.href = 'confirmacion.html';
            }
        }, 3000);
    }, 2000);
}

/**
 * Procesar el formulario de consulta
 */
function processInquiryForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Cambiar estado del botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
    
    // Recolectar datos del formulario
    const formData = new FormData(form);
    
    // Simulación de envío (reemplazar con AJAX real)
    setTimeout(() => {
        // Simular respuesta exitosa
        showSuccessMessage('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
        
        // Limpiar formulario
        form.reset();
        
        // Restablecer botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }, 1500);
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccessMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'success-message';
    messageElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    // Buscar dónde insertar el mensaje
    const targetForm = document.querySelector('.contact-form form') || 
                      document.querySelector('.booking-form form') ||
                      document.querySelector('form');
                      
    if (targetForm) {
        // Insertar al principio del formulario
        targetForm.insertAdjacentElement('afterbegin', messageElement);
        
        // Remover después de cierto tiempo
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 7000);
    }
}

/**
 * Mostrar error en un campo
 */
function showError(field, message) {
    // Limpiar error anterior
    clearError(field);
    
    // Añadir clase de error
    field.classList.add('error');
    
    // Crear mensaje de error
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    // Insertar después del campo
    field.parentNode.insertBefore(errorMessage, field.nextSibling);
}

/**
 * Limpiar mensaje de error
 */
function clearError(field) {
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Validar formato de email
 */
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

/**
 * Validar formato de teléfono
 */
function isValidPhone(phone) {
    // Permitir números, espacios, paréntesis, guiones y el símbolo +
    const regex = /^[+()0-9\s-]{7,20}$/;
    return regex.test(phone);
}