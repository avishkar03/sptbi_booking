// Admin Options functionality for Restricted Booking
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ admin_options.js loaded");

    // Get references to admin option buttons
    const addColumnBtn = document.getElementById('addColumnBtn');
    const deleteColumnBtn = document.getElementById('deleteColumnBtn');
    const deleteSlotBtn = document.getElementById('deleteSlotBtn');

    // Get reference to the booking table
    const bookingTable = document.querySelector('.booking-table');

    // Track selected column header
    let selectedHeader = null;

    // Add event listeners to column headers for selection
    if (bookingTable) {
        const headers = bookingTable.querySelectorAll('th.room-header');
        headers.forEach(header => {
            header.addEventListener('click', function(e) {
                // Clear previous selection
                if (selectedHeader) {
                    selectedHeader.classList.remove('selected');
                }

                // Select this header
                header.classList.add('selected');
                selectedHeader = header;

                console.log('Selected column:', header.textContent);
            });
        });
    }

    // Add Column functionality
    if (addColumnBtn) {
        addColumnBtn.addEventListener('click', function() {
            // Show confirmation popup
            showConfirmationPopup(
                'Add New Column',
                'Are you sure you want to add a new meeting room column?',
                'Add Column',
                function() {
                    addNewColumn();
                }
            );
        });
    }

    // Delete Column functionality
    if (deleteColumnBtn) {
        deleteColumnBtn.addEventListener('click', function() {
            if (!selectedHeader) {
                showErrorPopup('No Column Selected', 'Please select a column header first.');
                return;
            }

            // Show confirmation popup
            showConfirmationPopup(
                'Delete Column',
                `Are you sure you want to delete the column "${selectedHeader.textContent}"?`,
                'Delete Column',
                function() {
                    deleteColumn(selectedHeader);
                }
            );
        });
    }

    // Delete Slot functionality
    if (deleteSlotBtn) {
        deleteSlotBtn.addEventListener('click', function() {
            // Check if any cell is selected
            const selectedCells = document.querySelectorAll('td.booking-cell.selected');
            if (selectedCells.length === 0) {
                showErrorPopup('No Slot Selected', 'Please select a booked slot first.');
                return;
            }

            // Show confirmation popup
            showConfirmationPopup(
                'Delete Booking',
                'Are you sure you want to delete the selected booking?',
                'Delete Booking',
                function() {
                    deleteBooking(selectedCells[0]);
                }
            );
        });
    }

    // Function to add a new column
    function addNewColumn() {
        // Get the current floor name from the URL
        const pathParts = window.location.pathname.split('/');
        const floorSlug = pathParts[pathParts.length - 2]; // e.g., "1st-floor"
        const floorName = floorSlug.replace('-', ' ');

        // Get the current number of rooms
        const headers = bookingTable.querySelectorAll('th.room-header');
        const roomCount = headers.length + 1;

        // Create new column name
        const newRoomName = `Meeting Room ${roomCount} - ${floorName}`;

        // Get CSRF token
        const csrfToken = getCookie('csrftoken');

        // Make API request to add column
        fetch('/booking/api/add-column/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                floor_slug: floorSlug,
                room_name: newRoomName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Reload the page to show the new column
                window.location.reload();
            } else {
                showErrorPopup('Error', data.message || 'Failed to add column');
            }
        })
        .catch(error => {
            console.error('Error adding column:', error);
            showErrorPopup('Error', 'Failed to add column. Please try again.');
        });
    }

    // Function to delete a column
    function deleteColumn(header) {
        // Get the room name from the header
        const roomName = header.textContent;

        // Get the current floor name from the URL
        const pathParts = window.location.pathname.split('/');
        const floorSlug = pathParts[pathParts.length - 2]; // e.g., "1st-floor"

        // Get CSRF token
        const csrfToken = getCookie('csrftoken');

        // Make API request to delete column
        fetch('/booking/api/delete-column/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                floor_slug: floorSlug,
                room_name: roomName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Reload the page to update the UI
                window.location.reload();
            } else {
                showErrorPopup('Error', data.message || 'Failed to delete column');
            }
        })
        .catch(error => {
            console.error('Error deleting column:', error);
            showErrorPopup('Error', 'Failed to delete column. Please try again.');
        });
    }

    // Function to delete a booking
    function deleteBooking(cell) {
        // Get booking details from the cell
        const room = cell.dataset.room;
        const timeSlot = cell.dataset.time;
        const date = document.querySelector('.date-display').dataset.date ||
                     document.querySelector('.date-display').textContent;

        // Get the current floor name from the URL
        const pathParts = window.location.pathname.split('/');
        const floorSlug = pathParts[pathParts.length - 2]; // e.g., "1st-floor"

        // Get CSRF token
        const csrfToken = getCookie('csrftoken');

        // Make API request to delete booking
        fetch('/booking/api/delete-booking/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                floor_slug: floorSlug,
                room: room,
                time_slot: timeSlot,
                date: date
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Clear the cell content and remove booked classes
                cell.innerHTML = '';
                cell.classList.remove('booked', 'pending', 'selected');
                cell.style.backgroundColor = '';
                cell.style.color = '';

                // Show success message
                showSuccessPopup('Success', 'Booking deleted successfully');
            } else {
                showErrorPopup('Error', data.message || 'Failed to delete booking');
            }
        })
        .catch(error => {
            console.error('Error deleting booking:', error);
            showErrorPopup('Error', 'Failed to delete booking. Please try again.');
        });
    }

    // Helper function to show confirmation popup
    function showConfirmationPopup(title, message, confirmText, onConfirm) {
        // Create popup container
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '30px';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '400px';
        popup.style.textAlign = 'center';

        // Create title
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;

        // Set title color based on action type
        if (title.toLowerCase().includes('delete')) {
            titleElement.style.color = '#e53e3e'; // Red for delete actions
        } else if (title.toLowerCase().includes('add')) {
            titleElement.style.color = '#38a169'; // Green for add actions
        } else {
            titleElement.style.color = '#1e3a8a'; // Blue for other actions
        }

        titleElement.style.marginBottom = '15px';
        titleElement.style.fontSize = '24px';

        // Create message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '25px';
        messageElement.style.fontSize = '16px';
        messageElement.style.color = '#333';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '15px';

        // Create confirm button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = confirmText;
        confirmButton.style.padding = '10px 20px';

        // Set button color based on action type
        if (confirmText.toLowerCase().includes('delete')) {
            confirmButton.style.backgroundColor = '#e53e3e'; // Red for delete actions
        } else if (confirmText.toLowerCase().includes('add')) {
            confirmButton.style.backgroundColor = '#38a169'; // Green for add actions
        } else {
            confirmButton.style.backgroundColor = '#1e3a8a'; // Blue for other actions
        }

        confirmButton.style.color = 'white';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '4px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.minWidth = '120px';

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '10px 20px';
        cancelButton.style.backgroundColor = '#f3f4f6';
        cancelButton.style.color = '#1f2937';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.minWidth = '120px';

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9998';

        // Add event listeners
        confirmButton.addEventListener('click', function() {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
            onConfirm();
        });

        cancelButton.addEventListener('click', function() {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        });

        // Assemble popup
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        popup.appendChild(titleElement);
        popup.appendChild(messageElement);
        popup.appendChild(buttonsContainer);

        // Add to document
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    // Helper function to show error popup
    function showErrorPopup(title, message) {
        // Create popup container
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '30px';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '400px';
        popup.style.textAlign = 'center';

        // Create title
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.color = '#e53e3e';
        titleElement.style.marginBottom = '15px';
        titleElement.style.fontSize = '24px';

        // Create message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '25px';
        messageElement.style.fontSize = '16px';
        messageElement.style.color = '#333';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#e53e3e';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.minWidth = '120px';

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9998';

        // Add event listener
        closeButton.addEventListener('click', function() {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        });

        // Assemble popup
        popup.appendChild(titleElement);
        popup.appendChild(messageElement);
        popup.appendChild(closeButton);

        // Add to document
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    // Helper function to show success popup
    function showSuccessPopup(title, message) {
        // Create popup container
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '30px';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '400px';
        popup.style.textAlign = 'center';

        // Create title
        const titleElement = document.createElement('h2');
        titleElement.textContent = title.includes('Success') ? 'Success!' : title;
        titleElement.style.color = '#38a169'; // Green for success
        titleElement.style.marginBottom = '15px';
        titleElement.style.fontSize = '24px';

        // Create message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '25px';
        messageElement.style.fontSize = '16px';
        messageElement.style.color = '#333';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#38a169';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.minWidth = '120px';

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9998';

        // Add event listener
        closeButton.addEventListener('click', function() {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        });

        // Assemble popup
        popup.appendChild(titleElement);
        popup.appendChild(messageElement);
        popup.appendChild(closeButton);

        // Add to document
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    // Helper function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
