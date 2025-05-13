/**
 * Django Message Handler
 * This script converts Django messages to custom dialog boxes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Process Django messages
    processDjangoMessages();

    // Replace standard alerts with custom dialogs
    overrideAlerts();

    // Process any Django messages that might be in the page
    processExistingAlerts();
});

/**
 * Process Django messages and convert them to custom dialogs
 */
function processDjangoMessages() {
    // Find all Django message containers
    const messageContainers = document.querySelectorAll('.django-messages, .alert, .messages');

    messageContainers.forEach(container => {
        // Process each message in the container
        const messages = container.querySelectorAll('.alert, .message');

        if (messages.length > 0) {
            messages.forEach(message => {
                // Determine message type
                let type = 'INFO';
                if (message.classList.contains('alert-success') || message.classList.contains('success')) {
                    type = 'SUCCESS';
                } else if (message.classList.contains('alert-danger') || message.classList.contains('alert-error') || message.classList.contains('error')) {
                    type = 'ERROR';
                } else if (message.classList.contains('alert-warning') || message.classList.contains('warning')) {
                    type = 'WARNING';
                }

                // Get message content
                const messageText = message.textContent.trim();

                // Show as custom dialog
                if (messageText) {
                    // Always show success messages as modal dialogs
                    window.CustomDialog.showModal({
                        title: type === 'SUCCESS' ? 'Success' : (type === 'ERROR' ? 'Error' : (type === 'WARNING' ? 'Warning' : 'Information')),
                        message: messageText,
                        type: type,
                        buttons: [
                            {
                                text: 'OK',
                                type: 'primary',
                                callback: modal => window.CustomDialog.closeModal(modal)
                            }
                        ]
                    });
                }
            });

            // Hide the original message container
            container.style.display = 'none';
        }
    });

    // Also check for individual alert messages not in containers
    const individualAlerts = document.querySelectorAll('.alert:not(.django-messages .alert):not(.messages .alert)');

    individualAlerts.forEach(alert => {
        // Determine message type
        let type = 'INFO';
        if (alert.classList.contains('alert-success')) {
            type = 'SUCCESS';
        } else if (alert.classList.contains('alert-danger') || alert.classList.contains('alert-error')) {
            type = 'ERROR';
        } else if (alert.classList.contains('alert-warning')) {
            type = 'WARNING';
        }

        // Get message content
        const messageText = alert.textContent.trim();

        // Show as custom dialog
        if (messageText) {
            // Always show all messages as modal dialogs
            window.CustomDialog.showModal({
                title: type === 'SUCCESS' ? 'Success' : (type === 'ERROR' ? 'Error' : (type === 'WARNING' ? 'Warning' : 'Information')),
                message: messageText,
                type: type,
                buttons: [
                    {
                        text: 'OK',
                        type: 'primary',
                        callback: modal => window.CustomDialog.closeModal(modal)
                    }
                ]
            });
        }

        // Hide the original alert
        alert.style.display = 'none';
    });
}

/**
 * Override standard JavaScript alert, confirm, and prompt with custom dialogs
 */
function overrideAlerts() {
    // Store original functions
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    // Override alert
    window.alert = function(message) {
        window.CustomDialog.showModal({
            title: 'Alert',
            message: message,
            type: 'INFO',
            buttons: [
                {
                    text: 'OK',
                    type: 'primary',
                    callback: modal => window.CustomDialog.closeModal(modal)
                }
            ]
        });
    };

    // Override confirm
    window.confirm = function(message) {
        return new Promise((resolve) => {
            window.CustomDialog.showConfirmation(
                message,
                () => resolve(true),
                () => resolve(false)
            );
        });
    };
}

/**
 * Show a success message
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    // Always use modal dialogs for success messages
    window.CustomDialog.showModal({
        title: 'Success',
        message: message,
        type: 'SUCCESS',
        buttons: [
            {
                text: 'OK',
                type: 'primary',
                callback: modal => window.CustomDialog.closeModal(modal)
            }
        ]
    });
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    window.CustomDialog.showModal({
        title: 'Error',
        message: message,
        type: 'ERROR',
        buttons: [
            {
                text: 'OK',
                type: 'primary',
                callback: modal => window.CustomDialog.closeModal(modal)
            }
        ]
    });
}

/**
 * Show a warning message
 * @param {string} message - The warning message to display
 */
function showWarningMessage(message) {
    window.CustomDialog.showModal({
        title: 'Warning',
        message: message,
        type: 'WARNING',
        buttons: [
            {
                text: 'OK',
                type: 'primary',
                callback: modal => window.CustomDialog.closeModal(modal)
            }
        ]
    });
}

/**
 * Show an info message
 * @param {string} message - The info message to display
 */
function showInfoMessage(message) {
    window.CustomDialog.showModal({
        title: 'Information',
        message: message,
        type: 'INFO',
        buttons: [
            {
                text: 'OK',
                type: 'primary',
                callback: modal => window.CustomDialog.closeModal(modal)
            }
        ]
    });
}

/**
 * Process any existing alerts in the page
 */
function processExistingAlerts() {
    // Look for Django message alerts
    const alerts = document.querySelectorAll('.alert');

    alerts.forEach(alert => {
        // Get the message type
        let type = 'INFO';
        if (alert.classList.contains('alert-success')) {
            type = 'SUCCESS';
        } else if (alert.classList.contains('alert-danger') || alert.classList.contains('alert-error')) {
            type = 'ERROR';
        } else if (alert.classList.contains('alert-warning')) {
            type = 'WARNING';
        }

        // Get the message content
        const messageText = alert.textContent.trim();

        // Show as custom dialog
        if (messageText) {
            // Show all messages as modal dialogs
            window.CustomDialog.showModal({
                title: type === 'SUCCESS' ? 'Success' :
                       (type === 'ERROR' ? 'Error' :
                       (type === 'WARNING' ? 'Warning' : 'Information')),
                message: messageText,
                type: type,
                buttons: [
                    {
                        text: 'OK',
                        type: 'primary',
                        callback: modal => window.CustomDialog.closeModal(modal)
                    }
                ]
            });
        }

        // Hide the original alert
        alert.style.display = 'none';
    });
}

// Export functions
window.MessageHandler = {
    showSuccessMessage,
    showErrorMessage,
    showWarningMessage,
    showInfoMessage,
    processDjangoMessages,
    processExistingAlerts
};
