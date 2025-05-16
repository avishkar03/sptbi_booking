// /**
//  * Custom Dialog Box System
//  * This file provides a set of functions to create and manage custom dialog boxes
//  * for notifications, confirmations, and alerts.
//  */

// // Store references to active dialogs
// const activeDialogs = {
//     notifications: [],
//     modals: []
// };

// // Dialog types and their corresponding styles
// const DIALOG_TYPES = {
//     SUCCESS: {
//         icon: '<i class="fas fa-check-circle"></i>',
//         color: '#4CAF50',
//         title: 'Success'
//     },
//     REQUEST: {
//         icon: '<i class="fas fa-check-circle"></i>',
//         color: '#4CAF50',
//         title: 'Request Submitted'
//     },
//     ERROR: {
//         icon: '<i class="fas fa-exclamation-circle"></i>',
//         color: '#F44336',
//         title: 'Error'
//     },
//     WARNING: {
//         icon: '<i class="fas fa-exclamation-triangle"></i>',
//         color: '#FF9800',
//         title: 'Warning'
//     },
//     INFO: {
//         icon: '<i class="fas fa-info-circle"></i>',
//         color: '#2196F3',
//         title: 'Information'
//     }
// };

// /**
//  * Show a notification dialog
//  * @param {string} message - The message to display
//  * @param {string} type - The type of notification (SUCCESS, ERROR, WARNING, INFO)
//  * @param {number} duration - How long to show the notification in ms (default: 5000)
//  */
// function showNotification(message, type = 'SUCCESS', duration = 5000) {
//     // Instead of showing a notification, show a modal dialog
//     return showModal({
//         title: DIALOG_TYPES[type]?.title || 'Message',
//         message: message,
//         type: type,
//         buttons: [
//             {
//                 text: 'OK',
//                 type: 'primary',
//                 callback: modal => closeModal(modal)
//             }
//         ]
//     });
// }

// /**
//  * Close a notification dialog
//  * @param {HTMLElement} notification - The notification element to close
//  */
// function closeNotification(notification) {
//     // For backward compatibility, if notification is a modal, close it
//     if (notification && typeof notification === 'object') {
//         closeModal(notification);
//     }
// }

// /**
//  * Position multiple notifications with proper spacing
//  * (Kept for backward compatibility)
//  */
// function positionNotifications() {
//     // This function is no longer needed as we're using modals instead of notifications
//     // But we keep it for backward compatibility
// }

// /**
//  * Show a modal dialog
//  * @param {Object} options - Modal options
//  * @param {string} options.title - The modal title
//  * @param {string} options.message - The modal message
//  * @param {string} options.type - The type of modal (SUCCESS, ERROR, WARNING, INFO)
//  * @param {Array} options.buttons - Array of button configurations
//  * @returns {HTMLElement} - The modal element
//  */
// function showModal(options) {
//     const defaults = {
//         title: 'Message',
//         message: '',
//         type: 'INFO',
//         buttons: [
//             {
//                 text: 'OK',
//                 type: 'primary',
//                 callback: () => closeModal(modal)
//             }
//         ]
//     };

//     const settings = {...defaults, ...options};
//     const dialogType = DIALOG_TYPES[settings.type] || DIALOG_TYPES.INFO;

//     // Create overlay
//     const overlay = document.createElement('div');
//     overlay.className = 'custom-modal-overlay';
//     overlay.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background-color: rgba(0, 0, 0, 0.5);
//         z-index: 9999;
//         opacity: 0;
//         transition: opacity 0.3s ease;
//     `;

//     // Create modal
//     const modal = document.createElement('div');
//     modal.className = 'custom-modal';
//     modal.style.cssText = `
//         position: fixed;
//         top: 50%;
//         left: 50%;
//         transform: translate(-50%, -50%) scale(0.9);
//         background-color: white;
//         border-radius: 8px;
//         box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
//         z-index: 10000;
//         width: 90%;
//         max-width: 500px;
//         opacity: 0;
//         transition: opacity 0.3s ease, transform 0.3s ease;
//         overflow: hidden;
//     `;

//     // Create modal header
//     const modalHeader = document.createElement('div');
//     modalHeader.className = 'custom-modal-header';
//     modalHeader.style.cssText = `
//         padding: 16px 20px;
//         background-color: ${dialogType.color};
//         color: white;
//         display: flex;
//         align-items: center;
//     `;

//     modalHeader.innerHTML = `
//         <div class="modal-icon" style="margin-right: 12px; font-size: 24px;">
//             ${dialogType.icon}
//         </div>
//         <h2 style="margin: 0; font-size: 20px; font-weight: 500;">
//             ${settings.title || dialogType.title}
//         </h2>
//     `;

//     // Create modal body
//     const modalBody = document.createElement('div');
//     modalBody.className = 'custom-modal-body';
//     modalBody.style.cssText = `
//         padding: 20px;
//         color: #333;
//         font-size: 16px;
//         line-height: 1.5;
//     `;
//     modalBody.innerHTML = settings.message;

//     // Create modal footer
//     const modalFooter = document.createElement('div');
//     modalFooter.className = 'custom-modal-footer';
//     modalFooter.style.cssText = `
//         padding: 16px 20px;
//         background-color: #f5f5f5;
//         display: flex;
//         justify-content: flex-end;
//         gap: 10px;
//     `;

//     // Add buttons
//     settings.buttons.forEach(button => {
//         const buttonElement = document.createElement('button');
//         buttonElement.textContent = button.text;
//         buttonElement.style.cssText = `
//             padding: 8px 16px;
//             border-radius: 4px;
//             cursor: pointer;
//             font-size: 14px;
//             font-weight: 500;
//             border: none;
//             transition: background-color 0.2s ease;
//         `;

//         // Set button style based on type
//         switch (button.type) {
//             case 'primary':
//                 buttonElement.style.backgroundColor = dialogType.color;
//                 buttonElement.style.color = 'white';
//                 break;
//             case 'secondary':
//                 buttonElement.style.backgroundColor = '#f5f5f5';
//                 buttonElement.style.color = '#333';
//                 buttonElement.style.border = '1px solid #ddd';
//                 break;
//             case 'danger':
//                 buttonElement.style.backgroundColor = '#F44336';
//                 buttonElement.style.color = 'white';
//                 break;
//             default:
//                 buttonElement.style.backgroundColor = '#f5f5f5';
//                 buttonElement.style.color = '#333';
//                 buttonElement.style.border = '1px solid #ddd';
//         }

//         // Add hover effect
//         buttonElement.addEventListener('mouseover', () => {
//             if (button.type === 'primary') {
//                 buttonElement.style.backgroundColor = adjustColor(dialogType.color, -20);
//             } else if (button.type === 'danger') {
//                 buttonElement.style.backgroundColor = '#D32F2F';
//             } else {
//                 buttonElement.style.backgroundColor = '#e0e0e0';
//             }
//         });

//         buttonElement.addEventListener('mouseout', () => {
//             if (button.type === 'primary') {
//                 buttonElement.style.backgroundColor = dialogType.color;
//             } else if (button.type === 'danger') {
//                 buttonElement.style.backgroundColor = '#F44336';
//             } else {
//                 buttonElement.style.backgroundColor = '#f5f5f5';
//             }
//         });

//         // Add click handler
//         buttonElement.addEventListener('click', () => {
//             if (button.callback) {
//                 button.callback(modal);
//             } else {
//                 closeModal(modal);
//             }
//         });

//         modalFooter.appendChild(buttonElement);
//     });

//     // Assemble modal
//     modal.appendChild(modalHeader);
//     modal.appendChild(modalBody);
//     modal.appendChild(modalFooter);

//     // Add to document
//     document.body.appendChild(overlay);
//     document.body.appendChild(modal);
//     activeDialogs.modals.push({modal, overlay});

//     // Animate in - use a slightly longer delay to ensure transitions are properly applied
//     setTimeout(() => {
//         overlay.style.opacity = '1';
//         modal.style.opacity = '1';
//         modal.style.transform = 'translate(-50%, -50%) scale(1)';
//     }, 50);

//     return modal;
// }

// /**
//  * Close a modal dialog
//  * @param {HTMLElement} modal - The modal element to close
//  */
// function closeModal(modal) {
//     // Find the modal and overlay in active dialogs
//     const modalObj = activeDialogs.modals.find(m => m.modal === modal);
//     if (!modalObj) return;

//     const { modal: modalElement, overlay } = modalObj;

//     // Ensure transition properties are set
//     modalElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
//     overlay.style.transition = 'opacity 0.3s ease';

//     // Animate out
//     modalElement.style.opacity = '0';
//     modalElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
//     overlay.style.opacity = '0';

//     // Remove from DOM after animation
//     setTimeout(() => {
//         if (document.body.contains(modalElement)) {
//             document.body.removeChild(modalElement);
//         }
//         if (document.body.contains(overlay)) {
//             document.body.removeChild(overlay);
//         }

//         // Remove from active dialogs
//         const index = activeDialogs.modals.indexOf(modalObj);
//         if (index > -1) {
//             activeDialogs.modals.splice(index, 1);
//         }
//     }, 300);
// }

// /**
//  * Show a confirmation dialog
//  * @param {string} message - The confirmation message
//  * @param {Function} onConfirm - Callback when confirmed
//  * @param {Function} onCancel - Callback when canceled
//  * @param {Object} options - Additional options
//  * @returns {HTMLElement} - The modal element
//  */
// function showConfirmation(message, onConfirm, onCancel, options = {}) {
//     const defaults = {
//         title: 'Confirmation',
//         type: 'WARNING',
//         confirmText: 'Confirm',
//         cancelText: 'Cancel'
//     };

//     const settings = {...defaults, ...options};

//     return showModal({
//         title: settings.title,
//         message,
//         type: settings.type,
//         buttons: [
//             {
//                 text: settings.cancelText,
//                 type: 'secondary',
//                 callback: modal => {
//                     // First close the modal with animation
//                     closeModal(modal);
//                     // Then execute the cancel callback after the animation completes
//                     if (onCancel) {
//                         setTimeout(() => onCancel(), 300);
//                     }
//                 }
//             },
//             {
//                 text: settings.confirmText,
//                 type: 'primary',
//                 callback: modal => {
//                     // First close the modal with animation
//                     closeModal(modal);
//                     // Then execute the confirm callback after the animation completes
//                     if (onConfirm) {
//                         setTimeout(() => onConfirm(), 300);
//                     }
//                 }
//             }
//         ]
//     });
// }

// /**
//  * Create a confirmation button that shows a confirmation dialog when clicked
//  * @param {string} buttonSelector - CSS selector for the button element
//  * @param {string} message - The confirmation message to show when button is clicked
//  * @param {Function} onConfirm - Function to execute when user confirms
//  * @param {Object} options - Additional options for the confirmation dialog
//  */
// function createConfirmationButton(buttonSelector, message, onConfirm, options = {}) {
//     // Find the button element
//     const button = document.querySelector(buttonSelector);

//     if (!button) {
//         console.error(`Button not found with selector: ${buttonSelector}`);
//         return;
//     }

//     // Default options
//     const defaults = {
//         title: 'Confirmation',
//         type: 'WARNING',
//         confirmText: 'Confirm',
//         cancelText: 'Cancel'
//     };

//     const settings = {...defaults, ...options};

//     // Add click event listener to the button
//     button.addEventListener('click', function(event) {
//         // Prevent default action (like form submission)
//         event.preventDefault();

//         // Show confirmation dialog
//         showConfirmation(
//             message,
//             onConfirm,
//             null, // No cancel callback needed
//             settings
//         );
//     });

//     console.log(`Confirmation button created for: ${buttonSelector}`);
//     return button;
// }

// /**
//  * Adjust a color's brightness
//  * @param {string} color - The hex color to adjust
//  * @param {number} amount - The amount to adjust (-100 to 100)
//  * @returns {string} - The adjusted color
//  */
// function adjustColor(color, amount) {
//     return '#' + color.replace(/^#/, '').replace(/../g, color =>
//         ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
//     );
// }

// // Export functions
// window.CustomDialog = {
//     showNotification,
//     showModal,
//     showConfirmation,
//     closeNotification,
//     closeModal,
//     positionNotifications,
//     createConfirmationButton,
//     DIALOG_TYPES
// };
