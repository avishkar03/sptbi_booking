/**
 * Dialog Adapter
 * Ensures backward compatibility with existing code while using the enhanced dialog system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Make sure the enhanced dialog system is loaded
    if (!window.EnhancedDialog) {
        console.error('Enhanced Dialog system not loaded!');
        return;
    }

    // Create a CustomDialog object if it doesn't exist
    if (!window.CustomDialog) {
        window.CustomDialog = {};
    }

    // Store original methods if they exist
    const originalShowModal = window.CustomDialog.showModal;
    const originalShowConfirmation = window.CustomDialog.showConfirmation;
    const originalCloseModal = window.CustomDialog.closeModal;

    // Override showModal to use EnhancedDialog
    window.CustomDialog.showModal = function(options) {
        // Check if we're on a restricted booking page
        const isRestrictedBooking = window.location.pathname.includes('/booking/restricted-booking/');

        // Check if this is a deletion success message
        if ((options.title === 'Success' || options.title === 'Deletion Successful') &&
            options.message &&
            options.message.includes('deleted') &&
            isRestrictedBooking) {

            // Extract the number of slots deleted if available
            let numSlots = '1';
            const numMatch = options.message.match(/(\d+) slots?/);
            if (numMatch && numMatch[1]) {
                numSlots = numMatch[1];
            }

            // Create a simplified message
            const simplifiedMessage = `Successfully deleted ${numSlots} slot(s)`;

            // Use our custom deletion success dialog
            return window.EnhancedDialog.showDeletionSuccessDialog(simplifiedMessage);
        }

        // For booking success in restricted booking
        if (options.title === 'Booking Successful' && isRestrictedBooking) {
            options.title = 'Request Submitted';

            // Modify message for restricted booking
            if (options.message && options.message.includes('Successfully booked')) {
                options.message = options.message.replace('Successfully booked', 'Successfully submitted request for');
            }
        }

        // For all other dialogs, use the standard modal
        return window.EnhancedDialog.showModal({
            title: options.title,
            message: options.message,
            type: options.type,
            buttons: options.buttons.map(btn => ({
                text: btn.text,
                type: btn.type === 'primary' ? 'primary' : 'secondary',
                callback: btn.callback ?
                    (modalObj) => btn.callback(modalObj) :
                    null
            }))
        });
    };

    // Override showConfirmation to use EnhancedDialog
    window.CustomDialog.showConfirmation = function(message, onConfirm, onCancel, options = {}) {
        // Check if we're on a restricted booking page
        const isRestrictedBooking = window.location.pathname.includes('/booking/restricted-booking/');

        // Determine dialog title based on context
        let title = options && options.title ? options.title : 'Confirm';
        if (title === 'Delete Booking' && isRestrictedBooking) {
            title = 'Delete Request';
        }

        // Determine confirmation text based on context
        let confirmText = options && options.confirmText ? options.confirmText : 'Confirm';
        if (confirmText === 'Delete Booking' && isRestrictedBooking) {
            confirmText = 'Delete Request';
        }

        // Determine dialog message based on context
        if (message && message.includes('booking') && isRestrictedBooking) {
            message = message.replace('booking', 'booking request');
        }

        // Create enhanced confirmation dialog
        return window.EnhancedDialog.showConfirmation(
            message,
            onConfirm,
            onCancel,
            {
                title: title,
                type: options && options.type ? options.type : 'INFO',
                confirmText: confirmText,
                cancelText: options && options.cancelText ? options.cancelText : 'Cancel'
            }
        );
    };

    // Override closeModal to use EnhancedDialog
    window.CustomDialog.closeModal = function(modalObj) {
        window.EnhancedDialog.closeModal(modalObj);
    };

    console.log('Dialog adapter loaded - using enhanced dialog system');
});
