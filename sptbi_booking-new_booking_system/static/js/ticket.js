document.addEventListener('DOMContentLoaded', function() {
    console.log('ticket.js: DOMContentLoaded');
    const ticketForm = document.querySelector('#ticketForm');
    const titleInput = document.querySelector('#id_title');
    const descriptionInput = document.querySelector('#id_description');
    const priorityInput = document.querySelector('#id_priority');
    const successPopup = document.getElementById('successPopup');
    const overlay = document.getElementById('overlay');

    // Add ripple effect to buttons
    const rippleButtons = document.querySelectorAll('.btn-ripple');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 50%;
                pointer-events: none;
                width: 100px;
                height: 100px;
                top: ${y - 50}px;
                left: ${x - 50}px;
                transform: scale(0);
                opacity: 1;
                animation: rippleEffect 0.6s linear;
            `;

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add animation keyframes for ripple effect
    if (!document.getElementById('rippleEffectStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleEffectStyle';
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(2.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Form validation and submission
    if (ticketForm) {
        // Client-side validation before submission
        ticketForm.addEventListener('submit', function(e) {
            console.log('ticket.js: Form submit attempted');
            e.preventDefault();

            // Basic validation
            if (!titleInput.value.trim()) {
                showInputError(titleInput, 'Please enter a title');
                return;
            }

            if (!descriptionInput.value.trim()) {
                showInputError(descriptionInput, 'Please enter a description');
                return;
            }

            if (!priorityInput.value) {
                const prioritySelected = document.getElementById('priority-selected');
                prioritySelected.classList.add('error');
                prioritySelected.focus();
                return;
            }

            // Show loading state
            const submitBtn = ticketForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin btn-icon"></i> Submitting...';
            submitBtn.disabled = true;

            const formData = new FormData(ticketForm);

            fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Show success popup
                    successPopup.classList.add('show');
                    overlay.classList.add('show');

                    // Reset form
                    ticketForm.reset();

                    // Reset priority dropdown
                    const prioritySelected = document.getElementById('priority-selected');
                    const placeholder = document.createElement('span');
                    placeholder.className = 'priority-placeholder';
                    placeholder.textContent = 'Select priority';

                    const arrow = prioritySelected.querySelector('.dropdown-arrow');
                    prioritySelected.innerHTML = '';
                    prioritySelected.appendChild(placeholder);
                    prioritySelected.appendChild(arrow);
                } else {
                    showErrorMessage('Failed to submit ticket. Please try again.');
                }
            })
            .catch(error => {
                showErrorMessage('An error occurred. Please try again later.');
                console.error('Error:', error);
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });

        // Input focus effects
        const formInputs = document.querySelectorAll('.form-input');
        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                console.log('ticket.js: Input focused', input.id);
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                console.log('ticket.js: Input blurred', input.id, 'value:', input.value.trim());
                input.parentElement.classList.remove('focused');
                // Keep only focus/blur visual effects, remove blur validation
            });
        });
    }
});

// Helper function to show input error
function showInputError(input, message) {
    console.log('ticket.js: Showing input error for', input.id, 'message:', message);
    clearInputError(input);

    const errorMessage = document.createElement('div');
    errorMessage.className = 'input-error';
    errorMessage.textContent = message;
    errorMessage.style.cssText = `
        color: #e53e3e;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        animation: fadeIn 0.3s ease;
    `;

    input.classList.add('error');
    input.style.borderColor = '#e53e3e';
    input.parentElement.appendChild(errorMessage);

    // Add shake animation
    input.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(0)' }
    ], {
        duration: 300,
        easing: 'ease-in-out'
    });
}

// Helper function to clear input error
function clearInputError(input) {
    console.log('ticket.js: Clearing input error for', input.id);
    const errorMessage = input.parentElement.querySelector('.input-error');
    if (errorMessage) {
        errorMessage.remove();
    }

    input.classList.remove('error');
    input.style.borderColor = '';
}

// Helper function to show error message
function showErrorMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <div class="error-icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="error-message">${message}</div>
        <button class="close-toast">
            <i class="fas fa-times"></i>
        </button>
    `;

    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #fff;
        color: #e53e3e;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 90%;
        width: 350px;
    `;

    const errorIcon = toast.querySelector('.error-icon');
    errorIcon.style.cssText = `
        margin-right: 0.75rem;
        font-size: 1.25rem;
        color: #e53e3e;
    `;

    const errorMessage = toast.querySelector('.error-message');
    errorMessage.style.cssText = `
        flex: 1;
    `;

    const closeButton = toast.querySelector('.close-toast');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: #718096;
        cursor: pointer;
        padding: 0.25rem;
        margin-left: 0.75rem;
        font-size: 0.9rem;
    `;

    closeButton.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(100px)';

        setTimeout(() => {
            toast.remove();
        }, 300);
    });

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100px)';

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Function to close the success popup
function closePopup() {
    const successPopup = document.getElementById('successPopup');
    const overlay = document.getElementById('overlay');

    if (successPopup && overlay) {
        successPopup.classList.remove('show');
        overlay.classList.remove('show');
    }
}