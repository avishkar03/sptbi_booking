// /**
//  * Enhanced Dialog System
//  * A unified dialog system for both instant booking and restricted booking systems
//  * This file provides a comprehensive set of functions to create and manage dialog boxes
//  * with consistent styling and behavior across the application.
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
//         icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
//         color: '#FF9800',
//         title: 'Warning'
//     },
//     INFO: {
//         icon: '<i class="fas fa-info-circle"></i>',
//         color: '#2196F3',
//         title: 'Information'
//     },
//     CONFIRM: {
//         icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
//         color: '#FF9800',
//         title: 'Confirm Deletion'
//     }
// };

// /**
//  * Show a notification dialog
//  * @param {string} message - The message to display
//  * @param {string} type - The type of notification (SUCCESS, ERROR, WARNING, INFO, REQUEST)
//  * @param {number} duration - How long to show the notification in ms (default: 5000)
//  */
// function showNotification(message, type = 'SUCCESS', duration = 5000) {
//     // Always show as a modal dialog for consistency
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
//  * Show a modal dialog
//  * @param {Object} options - Modal options
//  * @param {string} options.title - The modal title
//  * @param {string} options.message - The modal message
//  * @param {string} options.type - The type of modal (SUCCESS, ERROR, WARNING, INFO, REQUEST)
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
//                 callback: modal => closeModal(modal)
//             }
//         ]
//     };

//     const settings = {...defaults, ...options};
//     const dialogType = DIALOG_TYPES[settings.type] || DIALOG_TYPES.INFO;

//     // Create overlay
//     const overlay = document.createElement('div');
//     overlay.className = 'enhanced-modal-overlay';
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

//     // Create modal container
//     const modal = document.createElement('div');
//     modal.className = 'enhanced-modal';
//     modal.style.cssText = `
//         position: fixed;
//         top: 50%;
//         left: 50%;
//         transform: translate(-50%, -50%) scale(0.95);
//         background-color: #fff;
//         border-radius: 5px;
//         box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
//         width: 90%;
//         max-width: 500px;
//         z-index: 10000;
//         opacity: 0;
//         transition: all 0.3s ease;
//         overflow: hidden;
//         padding: 0;
//     `;

//     // Create modal header
//     const modalHeader = document.createElement('div');
//     modalHeader.className = 'enhanced-modal-header';
//     modalHeader.style.cssText = `
//         padding: 15px 20px;
//         background-color: ${dialogType.color};
//         color: white;
//         display: flex;
//         align-items: center;
//     `;

//     // Create header title with icon
//     const modalTitle = document.createElement('div');
//     modalTitle.className = 'enhanced-modal-title';
//     modalTitle.style.cssText = `
//         display: flex;
//         align-items: center;
//         font-size: 18px;
//         font-weight: 500;
//         font-family: 'Anuphan', sans-serif;
//     `;
//     modalTitle.innerHTML = `<span style="margin-right: 10px;">${dialogType.icon}</span> <span>${settings.title}</span>`;

//     // Add title to header
//     modalHeader.appendChild(modalTitle);

//     // Create modal body
//     const modalBody = document.createElement('div');
//     modalBody.className = 'enhanced-modal-body';
//     modalBody.style.cssText = `
//         padding: 20px;
//         font-size: 16px;
//         line-height: 1.5;
//         color: #333;
//         font-family: 'Anuphan', sans-serif;
//     `;
//     modalBody.innerHTML = settings.message;

//     // Create modal footer
//     const modalFooter = document.createElement('div');
//     modalFooter.className = 'enhanced-modal-footer';
//     modalFooter.style.cssText = `
//         padding: 15px 20px;
//         display: flex;
//         justify-content: flex-end;
//         gap: 10px;
//     `;

//     // Add buttons to footer
//     settings.buttons.forEach(button => {
//         const buttonElement = document.createElement('button');
//         buttonElement.className = `enhanced-modal-button ${button.type === 'primary' ? 'primary' : 'secondary'}`;
//         buttonElement.textContent = button.text;

//         // Style based on button type and dialog type
//         if (button.type === 'primary') {
//             buttonElement.style.cssText = `
//                 background-color: ${dialogType.color};
//                 color: white;
//                 border: none;
//                 padding: 8px 16px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-size: 14px;
//                 font-weight: 500;
//                 transition: background-color 0.2s;
//                 font-family: 'Anuphan', sans-serif;
//             `;
//         } else {
//             buttonElement.style.cssText = `
//                 background-color: #f5f5f5;
//                 color: #333;
//                 border: 1px solid #ddd;
//                 padding: 8px 16px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-size: 14px;
//                 font-weight: 500;
//                 transition: background-color 0.2s;
//                 font-family: 'Anuphan', sans-serif;
//             `;
//         }

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

//     // Animate in
//     setTimeout(() => {
//         overlay.style.opacity = '1';
//         modal.style.opacity = '1';
//         modal.style.transform = 'translate(-50%, -50%) scale(1)';
//     }, 10);

//     return modal;
// }

// /**
//  * Close a modal dialog
//  * @param {HTMLElement} modal - The modal element to close
//  */
// function closeModal(modal) {
//     console.log('EnhancedDialog.closeModal called with:', modal);

//     // Handle case where modal is not provided or is not a DOM element
//     if (!modal) {
//         console.warn('closeModal called with null or undefined modal');
//         return;
//     }

//     if (!(modal instanceof HTMLElement)) {
//         console.warn('closeModal called with non-HTMLElement:', modal);
//         return;
//     }

//     const dialogInfo = activeDialogs.modals.find(info => info.modal === modal);
//     if (!dialogInfo) {
//         console.warn('No dialog info found for modal:', modal);
//         return;
//     }

//     const { overlay } = dialogInfo;
//     console.log('Found dialog info with overlay:', overlay);

//     // Animate out
//     modal.style.opacity = '0';
//     modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
//     overlay.style.opacity = '0';

//     // Remove after animation completes
//     setTimeout(() => {
//         try {
//             if (document.body.contains(modal)) {
//                 document.body.removeChild(modal);
//                 console.log('Removed modal from document');
//             } else {
//                 console.warn('Modal not found in document');
//             }

//             if (document.body.contains(overlay)) {
//                 document.body.removeChild(overlay);
//                 console.log('Removed overlay from document');
//             } else {
//                 console.warn('Overlay not found in document');
//             }

//             activeDialogs.modals = activeDialogs.modals.filter(info => info.modal !== modal);
//             console.log('Updated activeDialogs.modals, new count:', activeDialogs.modals.length);
//         } catch (error) {
//             console.error('Error removing dialog elements:', error);
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
//         title: 'Confirm Deletion',
//         type: 'CONFIRM',
//         confirmText: 'Delete',
//         cancelText: 'Cancel'
//     };

//     const settings = {...defaults, ...options};

//     // For deletion confirmations, use a special style
//     if (settings.title.toLowerCase().includes('delete') ||
//         settings.confirmText.toLowerCase().includes('delete')) {

//         // Create popup container
//         const popup = document.createElement('div');
//         popup.style.position = 'fixed';
//         popup.style.top = '50%';
//         popup.style.left = '50%';
//         popup.style.transform = 'translate(-50%, -50%)';
//         popup.style.backgroundColor = '#fff';
//         popup.style.padding = '0';
//         popup.style.borderRadius = '5px';
//         popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
//         popup.style.zIndex = '9999';
//         popup.style.minWidth = '400px';
//         popup.style.maxWidth = '500px';
//         popup.style.overflow = 'hidden';

//         // Create header with warning icon
//         const headerContainer = document.createElement('div');
//         headerContainer.style.backgroundColor = '#FF9800'; // Orange color for deletion warning
//         headerContainer.style.color = 'white';
//         headerContainer.style.padding = '15px 20px';
//         headerContainer.style.display = 'flex';
//         headerContainer.style.alignItems = 'center';

//         // Create warning icon
//         const warningIcon = document.createElement('div');
//         warningIcon.innerHTML = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
//                 <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
//             </svg>
//         `;
//         warningIcon.style.marginRight = '10px';

//         // Create title
//         const titleElement = document.createElement('h2');
//         titleElement.textContent = 'Confirm Deletion';
//         titleElement.style.margin = '0';
//         titleElement.style.fontSize = '18px';
//         titleElement.style.fontWeight = '500';

//         // Assemble header
//         headerContainer.appendChild(warningIcon);
//         headerContainer.appendChild(titleElement);

//         // Create message container
//         const contentContainer = document.createElement('div');
//         contentContainer.style.padding = '20px';
//         contentContainer.style.backgroundColor = '#fff';

//         // Create message
//         const messageElement = document.createElement('p');

//         // Customize message for slot deletion
//         if (message.includes('delete') && message.includes('booking')) {
//             if (message.includes('selected bookings')) {
//                 // Extract the number from the message
//                 const numMatch = message.match(/delete (\d+) selected/);
//                 const numSlots = numMatch ? numMatch[1] : '?';
//                 messageElement.textContent = `Are you sure you want to delete ${numSlots} slot(s)?`;
//             } else {
//                 messageElement.textContent = 'Are you sure you want to delete this slot?';
//             }
//         } else {
//             messageElement.textContent = message;
//         }

//         messageElement.style.margin = '0 0 20px 0';
//         messageElement.style.fontSize = '16px';
//         messageElement.style.color = '#333';

//         // Create buttons container
//         const buttonsContainer = document.createElement('div');
//         buttonsContainer.style.display = 'flex';
//         buttonsContainer.style.justifyContent = 'flex-end';
//         buttonsContainer.style.gap = '10px';

//         // Create cancel button
//         const cancelButton = document.createElement('button');
//         cancelButton.textContent = settings.cancelText;
//         cancelButton.style.padding = '8px 16px';
//         cancelButton.style.backgroundColor = '#f5f5f5';
//         cancelButton.style.color = '#333';
//         cancelButton.style.border = '1px solid #ddd';
//         cancelButton.style.borderRadius = '4px';
//         cancelButton.style.cursor = 'pointer';
//         cancelButton.style.fontSize = '14px';

//         // Create delete button
//         const confirmButton = document.createElement('button');
//         confirmButton.textContent = settings.confirmText;
//         confirmButton.style.padding = '8px 16px';
//         confirmButton.style.backgroundColor = '#FF9800'; // Orange for delete
//         confirmButton.style.color = 'white';
//         confirmButton.style.border = 'none';
//         confirmButton.style.borderRadius = '4px';
//         confirmButton.style.cursor = 'pointer';
//         confirmButton.style.fontSize = '14px';

//         // Create overlay
//         const overlay = document.createElement('div');
//         overlay.style.position = 'fixed';
//         overlay.style.top = '0';
//         overlay.style.left = '0';
//         overlay.style.width = '100%';
//         overlay.style.height = '100%';
//         overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
//         overlay.style.zIndex = '9998';

//         // Add event listeners
//         confirmButton.addEventListener('click', function() {
//             // Add fade-out animation
//             popup.style.transition = 'opacity 0.2s ease-out';
//             overlay.style.transition = 'opacity 0.2s ease-out';
//             popup.style.opacity = '0';
//             overlay.style.opacity = '0';

//             // Remove elements after animation completes
//             setTimeout(function() {
//                 if (document.body.contains(popup)) document.body.removeChild(popup);
//                 if (document.body.contains(overlay)) document.body.removeChild(overlay);
//                 if (onConfirm) onConfirm();
//             }, 200);
//         });

//         cancelButton.addEventListener('click', function() {
//             // Add fade-out animation
//             popup.style.transition = 'opacity 0.2s ease-out';
//             overlay.style.transition = 'opacity 0.2s ease-out';
//             popup.style.opacity = '0';
//             overlay.style.opacity = '0';

//             // Remove elements after animation completes
//             setTimeout(function() {
//                 if (document.body.contains(popup)) document.body.removeChild(popup);
//                 if (document.body.contains(overlay)) document.body.removeChild(overlay);
//                 if (onCancel) onCancel();
//             }, 200);
//         });

//         // Assemble popup
//         buttonsContainer.appendChild(cancelButton);
//         buttonsContainer.appendChild(confirmButton);
//         contentContainer.appendChild(messageElement);
//         contentContainer.appendChild(buttonsContainer);

//         popup.appendChild(headerContainer);
//         popup.appendChild(contentContainer);

//         // Add to document
//         document.body.appendChild(overlay);
//         document.body.appendChild(popup);

//         // Add fade-in animation
//         popup.style.opacity = '0';
//         overlay.style.opacity = '0';
//         popup.style.transition = 'opacity 0.3s ease-in';
//         overlay.style.transition = 'opacity 0.3s ease-in';

//         // Trigger reflow to ensure the transition works
//         void popup.offsetWidth;

//         // Set opacity to 1 to fade in
//         popup.style.opacity = '1';
//         overlay.style.opacity = '1';

//         // Store in activeDialogs for tracking
//         activeDialogs.modals.push({modal: popup, overlay});

//         return popup;
//     } else {
//         // For non-deletion confirmations, use the standard modal
//         return showModal({
//             title: settings.title,
//             message,
//             type: settings.type,
//             buttons: [
//                 {
//                     text: settings.cancelText,
//                     type: 'secondary',
//                     callback: modal => {
//                         closeModal(modal);
//                         if (onCancel) onCancel();
//                     }
//                 },
//                 {
//                     text: settings.confirmText,
//                     type: 'primary',
//                     callback: modal => {
//                         closeModal(modal);
//                         if (onConfirm) onConfirm();
//                     }
//                 }
//             ]
//         });
//     }
// }

// /**
//  * Show a deletion success dialog with a green header
//  * @param {string} message - The success message to display
//  * @param {Function} onClose - Callback when closed
//  * @returns {HTMLElement} - The modal element
//  */
// function showDeletionSuccessDialog(message, onClose = null) {
//     // Create popup container
//     const popup = document.createElement('div');
//     popup.style.position = 'fixed';
//     popup.style.top = '50%';
//     popup.style.left = '50%';
//     popup.style.transform = 'translate(-50%, -50%)';
//     popup.style.backgroundColor = '#fff';
//     popup.style.padding = '0';
//     popup.style.borderRadius = '5px';
//     popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
//     popup.style.zIndex = '9999';
//     popup.style.minWidth = '300px';
//     popup.style.maxWidth = '400px';
//     popup.style.overflow = 'hidden';

//     // Create header with success icon
//     const headerContainer = document.createElement('div');
//     headerContainer.style.backgroundColor = '#4CAF50'; // Green color for success
//     headerContainer.style.color = 'white';
//     headerContainer.style.padding = '15px 20px';
//     headerContainer.style.display = 'flex';
//     headerContainer.style.alignItems = 'center';

//     // Create success icon (white checkmark)
//     const successIcon = document.createElement('div');
//     successIcon.innerHTML = `
//         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
//             <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
//         </svg>
//     `;
//     successIcon.style.marginRight = '10px';

//     // Create title
//     const titleElement = document.createElement('h2');
//     titleElement.textContent = 'Deletion Successful';
//     titleElement.style.margin = '0';
//     titleElement.style.fontSize = '18px';
//     titleElement.style.fontWeight = '500';

//     // Assemble header
//     headerContainer.appendChild(successIcon);
//     headerContainer.appendChild(titleElement);

//     // Create message container
//     const contentContainer = document.createElement('div');
//     contentContainer.style.padding = '20px';
//     contentContainer.style.backgroundColor = '#fff';

//     // Create message
//     const messageElement = document.createElement('p');
//     messageElement.textContent = message;
//     messageElement.style.margin = '0 0 20px 0';
//     messageElement.style.fontSize = '16px';
//     messageElement.style.color = '#333';
//     messageElement.style.textAlign = 'center';

//     // Create buttons container
//     const buttonsContainer = document.createElement('div');
//     buttonsContainer.style.display = 'flex';
//     buttonsContainer.style.justifyContent = 'center';
//     buttonsContainer.style.gap = '10px';

//     // Create OK button
//     const okButton = document.createElement('button');
//     okButton.textContent = 'OK';
//     okButton.style.padding = '8px 30px';
//     okButton.style.backgroundColor = '#4CAF50'; // Green for success
//     okButton.style.color = 'white';
//     okButton.style.border = 'none';
//     okButton.style.borderRadius = '4px';
//     okButton.style.cursor = 'pointer';
//     okButton.style.fontSize = '14px';
//     okButton.style.fontWeight = '500';

//     // Create overlay
//     const overlay = document.createElement('div');
//     overlay.style.position = 'fixed';
//     overlay.style.top = '0';
//     overlay.style.left = '0';
//     overlay.style.width = '100%';
//     overlay.style.height = '100%';
//     overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
//     overlay.style.zIndex = '9998';

//     // Add event listener
//     okButton.addEventListener('click', function() {
//         // Add fade-out animation
//         popup.style.transition = 'opacity 0.2s ease-out';
//         overlay.style.transition = 'opacity 0.2s ease-out';
//         popup.style.opacity = '0';
//         overlay.style.opacity = '0';

//         // Remove elements after animation completes
//         setTimeout(function() {
//             if (document.body.contains(popup)) document.body.removeChild(popup);
//             if (document.body.contains(overlay)) document.body.removeChild(overlay);
//             if (onClose) onClose();
//         }, 200);
//     });

//     // Assemble popup
//     buttonsContainer.appendChild(okButton);
//     contentContainer.appendChild(messageElement);
//     contentContainer.appendChild(buttonsContainer);

//     popup.appendChild(headerContainer);
//     popup.appendChild(contentContainer);

//     // Add to document
//     document.body.appendChild(overlay);
//     document.body.appendChild(popup);

//     // Add fade-in animation
//     popup.style.opacity = '0';
//     overlay.style.opacity = '0';
//     popup.style.transition = 'opacity 0.3s ease-in';
//     overlay.style.transition = 'opacity 0.3s ease-in';

//     // Trigger reflow to ensure the transition works
//     void popup.offsetWidth;

//     // Set opacity to 1 to fade in
//     popup.style.opacity = '1';
//     overlay.style.opacity = '1';

//     // Store in activeDialogs for tracking
//     activeDialogs.modals.push({modal: popup, overlay});

//     return popup;
// }

// // Export functions
// window.EnhancedDialog = {
//     showNotification,
//     showModal,
//     showConfirmation,
//     showDeletionSuccessDialog,
//     closeModal,
//     DIALOG_TYPES
// };

// console.log('Enhanced Dialog System loaded');