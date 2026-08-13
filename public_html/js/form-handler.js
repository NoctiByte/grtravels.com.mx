document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencia al formulario
    const form = document.getElementById("inquiry-form");
    
    // Si el formulario existe en la página
    if (form) {
        // Agregar el evento submit
        form.addEventListener("submit", handleSubmit);
    }
});

/**
 * Maneja el envío del formulario con AJAX
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    // Referencia a elementos del formulario
    const form = event.target;
    const statusDiv = document.getElementById("form-status");
    const submitButton = document.getElementById("submit-btn");
    const originalButtonText = submitButton.innerHTML;
    
    // Validar formulario antes de enviar
    if (!validateForm(form)) {
        return;
    }
    
    // Cambiar estado del botón
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Enviando...';
    
    // Crear mensaje de estado y mostrarlo
    statusDiv.innerHTML = "";
    statusDiv.className = "form-message info";
    statusDiv.style.display = "block";
    statusDiv.innerHTML = "Enviando tu mensaje...";
    
    // Obtener datos del formulario
    const formData = new FormData(form);
    
    try {
        // Enviar datos a Formspree
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Procesar respuesta
        if (response.ok) {
            // Éxito: mostrar mensaje y limpiar formulario
            statusDiv.className = "form-message success";
            statusDiv.innerHTML = "<i class='fas fa-check-circle'></i> ¡Gracias por tu mensaje! Te contactaremos pronto.";
            form.reset();
            
            // Opcional: redirigir después de unos segundos
            setTimeout(() => {
                window.location.href = "gracias.html";
            }, 3000);
        } else {
            // Error: mostrar el mensaje de error
            const data = await response.json();
            let errorMessage = "Hubo un problema al enviar tu formulario. Inténtalo nuevamente.";
            
            if (data && data.errors) {
                errorMessage = data.errors.map(error => error.message).join(", ");
            }
            
            statusDiv.className = "form-message error";
            statusDiv.innerHTML = `<i class='fas fa-exclamation-circle'></i> ${errorMessage}`;
        }
    } catch (error) {
        // Error de red u otro problema
        console.error('Error:', error);
        statusDiv.className = "form-message error";
        statusDiv.innerHTML = "<i class='fas fa-exclamation-circle'></i> Hubo un problema de conexión. Verifica tu internet e inténtalo nuevamente.";
    } finally {
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Valida los campos del formulario
 */
function validateForm(form) {
    let isValid = true;
    const statusDiv = document.getElementById("form-status");
    
    // Limpiar mensajes de error previos
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    // Remover clases de error
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));
    
    // Validar campos requeridos
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        const isUncheckedChoice = (field.type === 'checkbox' || field.type === 'radio') && !field.checked;
        if (isUncheckedChoice || !field.value.trim()) {
            isValid = false;
            markFieldAsInvalid(field, field.type === 'checkbox' ? 'Debes aceptar el aviso para enviar la solicitud' : 'Este campo es obligatorio');
        }
    });
    
    // Validar email
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            isValid = false;
            markFieldAsInvalid(emailField, 'Ingresa un correo electrónico válido');
        }
    }
    
    // Si hay errores, mostrar mensaje general
    if (!isValid) {
        statusDiv.className = "form-message error";
        statusDiv.style.display = "block";
        statusDiv.innerHTML = "<i class='fas fa-exclamation-circle'></i> Por favor corrige los errores en el formulario.";
    } else {
        statusDiv.style.display = "none";
    }
    
    return isValid;
}

/**
 * Marca un campo como inválido y muestra un mensaje de error
 */
function markFieldAsInvalid(field, message) {
    // Agregar clase de error al campo
    field.classList.add('is-invalid');
    
    // Crear mensaje de error
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Insertar mensaje después del campo
    const parent = field.closest('.form-group');
    if (parent) {
        parent.appendChild(errorElement);
    } else {
        field.insertAdjacentElement('afterend', errorElement);
    }
}
