document.addEventListener('DOMContentLoaded', function() {
    const ticketForm = document.querySelector('#ticketForm');
    const titleInput = document.querySelector('#id_title');
    const descriptionInput = document.querySelector('#id_description');
    
    console.log('Form elements:', { ticketForm, titleInput, descriptionInput });
    
    // Add focus/blur event listeners to debug input field behavior
    titleInput.addEventListener('focus', () => {
        console.log('Title input focused');
    });
    
    titleInput.addEventListener('blur', () => {
        console.log('Title input lost focus');
    });
    
    titleInput.addEventListener('input', () => {
        console.log('Title input value:', titleInput.value);
    });
    
    if (ticketForm) {
        // Client-side validation before submission
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const formData = new FormData(ticketForm);
            console.log('Form data:', Object.fromEntries(formData));
            
            fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    showSuccessPopup();
                    ticketForm.reset();
                } else {
                    throw new Error('Failed to save ticket');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to submit ticket. Please try again.');
            });
        });
    }
});

function showSuccessPopup() {
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: rgba(0, 0, 0, 0.5); z-index: 9999;';
    popup.innerHTML = `
        <div class="popup-content" style="background: white; padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); min-width: 300px; max-width: 90%; margin: 0;">
            <h2 style="color:rgb(52, 152, 56); margin-bottom: 1rem; font-size: 1.5rem;">Success!</h2>
            <p style="margin-bottom: 1.5rem;">Your ticket has been submitted successfully.</p>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #4CAF50; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; transition: background 0.2s;">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    requestAnimationFrame(() => {
        popup.style.opacity = '0';
        requestAnimationFrame(() => {
            popup.style.transition = 'opacity 0.3s ease';
            popup.style.opacity = '1';
        });
    });
}

// Add styles to head
const styles = document.createElement('style');
styles.textContent = `
.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: white;
    cursor: text;
    outline: none;
    color: #1f2937;
}

.form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    caret-color: #3b82f6;
}

.form-input::placeholder {
    color: #9ca3af;
    opacity: 1;
}

.success-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
}

.success-popup.show {
    opacity: 1;
}

.popup-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.popup-content h2 {
    color: #4CAF50;
    margin-bottom: 1rem;
}

.popup-content button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    cursor: pointer;
}

.popup-content button:hover {
    background: #45a049;
}
`;
document.head.appendChild(styles);

// .success-popup {
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0, 0, 0, 0.5);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     opacity: 0;
//     transition: opacity 0.3s ease;
//     z-index: 1000;
// }

// .success-popup.show {
//     opacity: 1;
// }

// .popup-content {
//     background: white;
//     padding: 2rem;
//     border-radius: 8px;
//     text-align: center;
//     box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
// }

// .popup-content h2 {
//     color: #4CAF50;
//     margin-bottom: 1rem;
// }

// .popup-content button {
//     background: #4CAF50;
//     color: white;
//     border: none;
//     padding: 0.5rem 1rem;
//     border-radius: 4px;
//     margin-top: 1rem;
//     cursor: pointer;
// }

// .popup-content button:hover {
//     background: #45a049;
// }
// `;
// document.head.appendChild(styles);
