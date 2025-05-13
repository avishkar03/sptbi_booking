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

    // We don't need to add event listeners to headers here since booking_with_approval.js handles that
    // Instead, we'll just set up a MutationObserver to track when headers get the 'selected' class
    if (bookingTable) {
        console.log("Setting up MutationObserver for header selection in admin_options.js");

        // Create a MutationObserver to watch for changes to the 'selected' class on headers
        const headerObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target.tagName === 'TH') {

                    const header = mutation.target;

                    // If this header now has the 'selected' class, update our selectedHeader
                    if (header.classList.contains('selected')) {
                        selectedHeader = header;
                        console.log('Admin options detected selected header:', header.textContent);
                    }
                    // If this was our selected header and it lost the 'selected' class, clear our reference
                    else if (selectedHeader === header) {
                        selectedHeader = null;
                        console.log('Admin options detected header deselection');
                    }
                }
            });
        });

        // Observe all headers
        const headers = bookingTable.querySelectorAll('th.room-header, th.selectable-header');
        headers.forEach(header => {
            headerObserver.observe(header, { attributes: true });

            // Check if any header is already selected when the page loads
            if (header.classList.contains('selected')) {
                selectedHeader = header;
                console.log('Admin options found pre-selected header:', header.textContent);
            }
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
            console.log("Delete Column button clicked");
            console.log("Current selectedHeader:", selectedHeader);

            // Check for any selected headers in case our tracking missed something
            if (!selectedHeader) {
                const anySelectedHeader = document.querySelector('th.room-header.selected, th.selectable-header.selected');
                if (anySelectedHeader) {
                    console.log("Found selected header that wasn't tracked:", anySelectedHeader.textContent);
                    selectedHeader = anySelectedHeader;
                }
            }

            // If still no selected header, show error
            if (!selectedHeader) {
                console.log("No column selected, showing error popup");
                showErrorPopup('No Column Selected', 'Please select a column header first.');
                return;
            }

            console.log("Selected header for deletion:", selectedHeader.textContent);

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
            console.log("Delete Slot button clicked");

            // Check if any cell is selected
            const selectedCells = document.querySelectorAll('td.booking-cell.selected');
            console.log("Found selected cells:", selectedCells.length);

            if (selectedCells.length === 0) {
                showErrorPopup('No Slot Selected', 'Please select a booked slot first.');
                return;
            }

            // Make sure the selected cell is actually booked
            const selectedCell = selectedCells[0];
            console.log("Selected cell for deletion:", selectedCell);
            console.log("Cell classes:", selectedCell.className);
            console.log("Cell data:", {
                room: selectedCell.dataset.room,
                time: selectedCell.dataset.time,
                floor: selectedCell.dataset.floor,
                booked: selectedCell.classList.contains('booked')
            });

            if (!selectedCell.classList.contains('booked')) {
                showErrorPopup('Not a Booked Slot', 'Please select a booked slot to delete.');
                return;
            }

            // Show confirmation popup
            showConfirmationPopup(
                'Delete Booking',
                'Are you sure you want to delete the selected booking?',
                'Delete Booking',
                function() {
                    deleteBooking(selectedCell);
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

        // Get the current number of rooms and existing room names
        const headers = bookingTable.querySelectorAll('th.room-header, th.selectable-header');
        const existingRoomNames = Array.from(headers).map(header => header.textContent.trim());

        console.log("Existing room names:", existingRoomNames);

        // Find all room numbers and identify gaps
        const roomNumbers = [];
        existingRoomNames.forEach(roomName => {
            // Extract room number from names like "Meeting Room 2 - 2nd floor"
            const match = roomName.match(/Meeting Room (\d+)/i);
            if (match && match[1]) {
                const roomNumber = parseInt(match[1], 10);
                if (!isNaN(roomNumber)) {
                    roomNumbers.push(roomNumber);
                }
            }
        });

        // Sort room numbers to find gaps
        roomNumbers.sort((a, b) => a - b);
        console.log("Existing room numbers:", roomNumbers);

        // Find the first available room number (either 1 if it's missing, or the next number)
        let nextRoomNumber = 1; // Start with 1 by default

        // If room numbers exist, check if 1 is missing or find the next available number
        if (roomNumbers.length > 0) {
            // Check if 1 is missing
            if (roomNumbers.indexOf(1) === -1) {
                nextRoomNumber = 1;
            } else {
                // Find the first gap in the sequence or use the next number after the highest
                let foundGap = false;
                for (let i = 0; i < roomNumbers.length; i++) {
                    // If there's a gap between consecutive numbers
                    if (i < roomNumbers.length - 1 && roomNumbers[i + 1] > roomNumbers[i] + 1) {
                        nextRoomNumber = roomNumbers[i] + 1;
                        foundGap = true;
                        break;
                    }
                }

                // If no gap was found, use the next number after the highest
                if (!foundGap) {
                    nextRoomNumber = roomNumbers[roomNumbers.length - 1] + 1;
                }
            }
        }

        console.log("Next room number:", nextRoomNumber);

        // Create new column name
        const newRoomName = `Meeting Room ${nextRoomNumber} - ${floorName}`;

        // Check if this room name already exists
        if (existingRoomNames.includes(newRoomName)) {
            showErrorPopup('Error', `Room "${newRoomName}" already exists. Please delete it first if you want to recreate it.`);
            return;
        }

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
        const roomName = header.textContent.trim();

        console.log("Deleting column with room name:", roomName);

        // Get the current floor name from the URL
        const pathParts = window.location.pathname.split('/');
        const floorSlug = pathParts[pathParts.length - 2]; // e.g., "2nd-floor"

        console.log("Floor slug from URL:", floorSlug);

        // Debug the header content
        console.log("Header element:", header);
        console.log("Header text content:", header.textContent);
        console.log("Header inner HTML:", header.innerHTML);

        // Get all room headers to debug
        const allHeaders = document.querySelectorAll('th.room-header, th.selectable-header');
        console.log("All room headers on page:");
        allHeaders.forEach((h, i) => {
            console.log(`Header ${i}:`, h.textContent.trim());
        });

        // Get CSRF token
        const csrfToken = getCookie('csrftoken');

        // Show a loading message
        const loadingPopup = showLoadingPopup('Deleting Column', 'Please wait while we delete the column...');

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
        .then(response => {
            console.log("Delete column response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Delete column response data:", data);

            // Remove the loading popup
            if (loadingPopup) {
                document.body.removeChild(loadingPopup.popup);
                document.body.removeChild(loadingPopup.overlay);
            }

            if (data.status === 'success') {
                // Show success message
                showSuccessPopup('Success', 'Column deleted successfully');

                // Reload the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showErrorPopup('Error', data.message || 'Failed to delete column');
            }
        })
        .catch(error => {
            console.error('Error deleting column:', error);

            // Remove the loading popup
            if (loadingPopup) {
                document.body.removeChild(loadingPopup.popup);
                document.body.removeChild(loadingPopup.overlay);
            }

            showErrorPopup('Error', 'Failed to delete column. Please try again.');
        });
    }

    // Helper function to show loading popup
    function showLoadingPopup(title, message) {
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
        titleElement.style.color = '#1e3a8a';
        titleElement.style.marginBottom = '15px';
        titleElement.style.fontSize = '24px';

        // Create message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '25px';
        messageElement.style.fontSize = '16px';
        messageElement.style.color = '#333';

        // Create loading spinner
        const spinner = document.createElement('div');
        spinner.style.border = '5px solid #f3f3f3';
        spinner.style.borderTop = '5px solid #1e3a8a';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.animation = 'spin 2s linear infinite';
        spinner.style.margin = '0 auto';

        // Add keyframe animation for spinner
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9998';

        // Assemble popup
        popup.appendChild(titleElement);
        popup.appendChild(messageElement);
        popup.appendChild(spinner);

        // Add to document
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        return { popup, overlay };
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

