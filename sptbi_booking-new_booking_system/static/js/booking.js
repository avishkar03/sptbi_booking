// Check if script has already been loaded to prevent double initialization
(function() {
    if (window.bookingJsLoaded) {
        console.log('booking.js already loaded, skipping initialization');
        return;
    }

    // Set flag to indicate script has been loaded
    window.bookingJsLoaded = true;
})();

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ LOADED: booking.js from root static/js/ directory');
    console.log('This is the 462-line version of booking.js');

    // Safely get DOM elements with null checks
    const addColumnBtn = document.getElementById('addColumnBtn');
    const deleteColumnBtn = document.getElementById('deleteColumnBtn');
    const bookingTable = document.querySelector('.booking-table');
    const floorSlug = document.querySelector('meta[name="floor-slug"]')?.content;
    const currentFloor = document.querySelector('meta[name="floor-name"]')?.content;
    const bookingInterface = document.querySelector('.booking-interface');
    const bookingReason = document.getElementById('bookingReason');
    const bookButton = document.getElementById('bookButton');

    // Check if the booking table exists before proceeding
    if (!bookingTable) {
        console.log('Booking table not found, skipping booking.js initialization');
        return;
    }

    // Debounce function to prevent multiple rapid clicks
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize cell selection functionality
    function initializeCellSelection() {
        try {
            console.log('Initializing cell selection...');

            // Check if user is admin - with enhanced debugging
            const isAdminMeta = document.querySelector('meta[name="is-admin"]');
            const debugAdminMeta = document.querySelector('meta[name="debug-admin"]');
            const debugUsernameMeta = document.querySelector('meta[name="debug-username"]');

            console.log('==== ADMIN STATUS DEBUG ====');
            console.log('Admin meta tag:', isAdminMeta);
            console.log('Debug admin meta tag:', debugAdminMeta);
            console.log('Debug username meta tag:', debugUsernameMeta);

            // Try multiple methods to detect admin status
            const isAdminFromMeta = isAdminMeta?.content === 'true';
            const debugIsAdmin = debugAdminMeta?.content === 'True';

            console.log(`User is admin (from is-admin meta): ${isAdminFromMeta}, Meta content: ${isAdminMeta?.content}`);
            console.log(`User is admin (from debug-admin meta): ${debugIsAdmin}, Meta content: ${debugAdminMeta?.content}`);
            console.log(`Username from meta: ${debugUsernameMeta?.content}`);

            // FORCE ADMIN STATUS TO TRUE FOR TESTING
            const isAdmin = true; // Force admin status to true
            console.log(`Final admin status (FORCED): ${isAdmin}`);

            // Set a global variable for admin status
            window.isUserAdmin = isAdmin;

            // Remove existing event listeners first
            const elements = document.querySelectorAll('.booking-cell, .room-header');
            console.log(`Found ${elements.length} elements to initialize`);

            if (elements.length > 0) {
                elements.forEach(element => {
                    if (element && element.parentNode) {
                        const newElement = element.cloneNode(true);
                        element.parentNode.replaceChild(newElement, element);
                    }
                });
            }

            // Process all cells (both booked and unbooked)
            const allCells = document.querySelectorAll('.booking-cell');
            console.log(`Found ${allCells.length} total cells to process`);

            if (allCells.length > 0) {
                allCells.forEach((cell, index) => {
                    if (cell) {
                        // Add data attributes for debugging
                        const timeSlot = cell.closest('tr').querySelector('.time-slot')?.textContent || 'unknown';
                        const roomHeader = cell.cellIndex > 0 ?
                            bookingTable.querySelector('thead tr').children[cell.cellIndex]?.textContent || 'unknown' :
                            'unknown';

                        cell.dataset.time = timeSlot;
                        cell.dataset.room = roomHeader;
                        cell.dataset.floor = floorSlug;

                        // Check if cell is already booked
                        const isBooked = cell.classList.contains('booked');

                        // Log the first few cells for debugging
                        if (index < 5) {
                            console.log(`Cell ${index}: time=${timeSlot}, room=${roomHeader}, floor=${floorSlug}, booked=${isBooked}`);
                        }

                        // Add click handler based on booking status and admin rights
                        cell.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Force refresh the data-booked attribute from the class
                            if (this.classList.contains('booked')) {
                                this.dataset.booked = 'true';
                                this.setAttribute('data-booked', 'true');
                            }

                            // Check if this cell has a booking text inside it
                            if (this.querySelector('.booked-text')) {
                                this.classList.add('booked');
                                this.dataset.booked = 'true';
                                this.setAttribute('data-booked', 'true');
                            }

                            // Get the current booking status - check both the class and the data attribute
                            const isBooked = this.classList.contains('booked') || this.dataset.booked === 'true';
                            console.log(`Cell clicked: time=${this.dataset.time}, room=${this.dataset.room}, booked=${isBooked}, data-booked=${this.dataset.booked}, classes=${this.className}`);

                            // If cell is booked and user is not admin, show message and return
                            if (isBooked && !isAdmin) {
                                window.CustomDialog.showModal({
                                    title: 'Slot Already Booked',
                                    message: 'This slot is already booked. Only administrators can modify booked slots.',
                                    type: 'ERROR',
                                    buttons: [
                                        {
                                            text: 'OK',
                                            type: 'primary',
                                            callback: modal => window.CustomDialog.closeModal(modal)
                                        }
                                    ]
                                });
                                console.log('Non-admin tried to select booked slot - prevented');
                                return;
                            }

                            // Debug: Always log if we're allowing selection
                            console.log(`Allowing selection of cell: booked=${isBooked}, isAdmin=${isAdmin}`);

                            // If cell is booked and user is admin, show warning in console and allow selection
                            if (isBooked && isAdmin) {
                                console.log('Admin is selecting a booked slot');
                                // Make sure the cursor is a pointer for admins
                                this.style.cursor = 'pointer';
                                // Force the data-is-admin attribute to be true
                                this.dataset.isAdmin = 'true';
                                this.setAttribute('data-is-admin', 'true');
                            }

                            // Toggle selection
                            this.classList.toggle('selected');

                            // Update styles
                            if (this.classList.contains('selected')) {
                                if (isBooked && isAdmin) {
                                    // Simple styling for booked cells selected by admin
                                    this.style.backgroundColor = '#1e40af'; // Same as regular selection
                                    this.style.color = 'white';
                                    this.style.cursor = 'pointer';

                                    // Make any text inside the cell visible
                                    const textElements = this.querySelectorAll('span');
                                    textElements.forEach(el => {
                                        el.style.color = 'white';
                                    });

                                    console.log('Applied admin selection styling to booked cell');
                                } else if (!isBooked) {
                                    // Normal styling for unbooked selected cells
                                    this.style.backgroundColor = '#1e40af';
                                    this.style.color = 'white';
                                    this.style.border = '';
                                }
                            } else {
                                // Reset styles when deselected
                                if (isBooked) {
                                    // Reset to booked style
                                    this.style.backgroundColor = '#f3f4f6';
                                    this.style.color = '#374151';
                                    this.style.border = '';
                                    this.style.cursor = isAdmin ? 'pointer' : 'not-allowed';

                                    // Reset text color
                                    const textElements = this.querySelectorAll('span');
                                    textElements.forEach(el => {
                                        el.style.color = '#374151';
                                    });
                                } else {
                                    // Reset to normal style
                                    this.style.backgroundColor = '';
                                    this.style.color = '';
                                    this.style.border = '';
                                }
                            }
                        });
                    }
                });
            }

            // Add click handler for header cells
            const headerCells = document.querySelectorAll('th.room-header');
            if (headerCells.length > 0) {
                headerCells.forEach(header => {
                    if (header) {
                        header.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Toggle selection
                            this.classList.toggle('selected');

                            // Update styles
                            if (this.classList.contains('selected')) {
                                this.style.backgroundColor = '#1e40af';
                                this.style.color = 'white';
                            } else {
                                this.style.backgroundColor = '';
                                this.style.color = '';
                            }
                        });
                    }
                });
            }

            // Style booked cells differently based on admin status
            const bookedCells = document.querySelectorAll('.booking-cell.booked, .booking-cell[data-booked="true"]');
            console.log(`Found ${bookedCells.length} booked cells to style`);
            console.log(`Admin status: ${isAdmin}`);

            if (bookedCells.length > 0) {
                bookedCells.forEach((cell, index) => {
                    if (cell) {
                        // For non-admin users, make booked cells not clickable
                        if (!isAdmin) {
                            cell.style.cursor = 'not-allowed';
                            cell.dataset.isAdmin = 'false';
                            cell.setAttribute('data-is-admin', 'false');
                        } else {
                            // For admin users, make booked cells clickable with a different cursor
                            cell.style.cursor = 'pointer';
                            cell.dataset.isAdmin = 'true';
                            cell.setAttribute('data-is-admin', 'true');

                            // No special styling for admin-selectable cells

                            console.log(`Set admin=true for booked cell ${index}`);
                        }

                        // Set default background color for booked cells
                        cell.style.backgroundColor = '#f3f4f6';

                        // Make sure data-booked attribute is set
                        cell.dataset.booked = 'true';
                        cell.setAttribute('data-booked', 'true');

                        // Add a class to make CSS targeting easier
                        cell.classList.add('booked');

                        // Add "Booked by" prefix to existing bookings if not already present
                        const textElement = cell.querySelector('.booked-text');
                        if (textElement && !textElement.textContent.trim().startsWith('Booked by:')) {
                            textElement.textContent = 'Booked by: ' + textElement.textContent.trim();
                        }

                        // Log the first few cells for debugging
                        if (index < 3) {
                            console.log(`Booked cell ${index}: isAdmin=${cell.dataset.isAdmin}, cursor=${cell.style.cursor}`);
                        }
                    }
                });
            }

            // Also check for cells with booking text inside them
            document.querySelectorAll('.booking-cell:not(.booked)').forEach(cell => {
                if (cell.querySelector('.booked-text') || cell.textContent.trim() !== '') {
                    // This cell has content but isn't marked as booked
                    cell.classList.add('booked');
                    cell.dataset.booked = 'true';
                    cell.setAttribute('data-booked', 'true');

                    if (isAdmin) {
                        cell.style.cursor = 'pointer';
                        cell.dataset.isAdmin = 'true';
                        cell.setAttribute('data-is-admin', 'true');
                        // No special styling for admin-selectable cells
                    } else {
                        cell.style.cursor = 'not-allowed';
                    }

                    console.log(`Found unmarked booked cell with text: ${cell.textContent.trim()}`);
                }
            });
        } catch (error) {
            console.error('Error in initializeCellSelection:', error);
        }
    }
    // Initialize column deletion functionality
    if (deleteColumnBtn) {
        deleteColumnBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const selectedHeaders = document.querySelectorAll('th.room-header.selected');
            if (selectedHeaders.length === 0) {
                window.CustomDialog.showModal({
                    title: 'No Selection',
                    message: 'Please select at least one column header to delete.',
                    type: 'WARNING',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'primary',
                            callback: modal => window.CustomDialog.closeModal(modal)
                        }
                    ]
                });
                return;
            }

            window.CustomDialog.showConfirmation(
                'Are you sure you want to delete the selected columns?',
                () => {
                    // Get indices of selected headers (excluding time slot column)
                    const columnIndices = Array.from(selectedHeaders).map(header =>
                        Array.from(header.parentNode.children).indexOf(header)
                    );

                    // Delete the columns and update the server
                    deleteColumns(columnIndices);
                },
                () => {
                    // User canceled, do nothing
                    return;
                },
                {
                    title: 'Confirm Deletion',
                    type: 'WARNING',
                    confirmText: 'Delete',
                    cancelText: 'Cancel'
                }
            );

            return; // Return early since we're handling this in the confirmation callback
        });
    }

    // Function to delete columns
    async function deleteColumns(columnIndices) {
        try {
            const response = await fetch('/booking/delete_columns/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    floor: floorSlug,
                    column_indices: columnIndices
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Remove selected columns from the table
                columnIndices.sort((a, b) => b - a).forEach(index => {
                    document.querySelectorAll('tr').forEach(row => {
                        if (row.children[index]) {
                            row.children[index].remove();
                        }
                    });
                });
            } else {
                window.CustomDialog.showModal({
                    title: 'Deletion Failed',
                    message: 'Failed to delete columns: ' + (data.message || 'Unknown error'),
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
        } catch (error) {
            console.error('Error:', error);
            window.CustomDialog.showModal({
                title: 'Error',
                message: 'Failed to delete columns. Please try again.',
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
    }

    // Initialize booking functionality
    if (bookButton) {
        // Remove any existing click listeners by cloning and replacing the button
        const newBookButton = bookButton.cloneNode(true);
        bookButton.parentNode.replaceChild(newBookButton, bookButton);
        // Use the new button for event listeners
        const bookButtonRef = newBookButton;

        // Flag to prevent multiple submissions
        let isSubmitting = false;

        // Create a handler for the booking function (without debounce delay)
        const bookingHandler = async function() {
            // Prevent multiple submissions
            if (isSubmitting) {
                console.log('Booking submission already in progress, ignoring duplicate click');
                return;
            }

            const selectedCells = document.querySelectorAll('.booking-cell.selected');
            if (selectedCells.length === 0) {
                window.CustomDialog.showModal({
                    title: 'No Selection',
                    message: 'Please select at least one slot',
                    type: 'WARNING',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'primary',
                            callback: modal => window.CustomDialog.closeModal(modal)
                        }
                    ]
                });
                return;
            }

            const reason = bookingReason.value.trim();
            if (!reason) {
                window.CustomDialog.showModal({
                    title: 'Missing Information',
                    message: 'Please enter a reason for booking',
                    type: 'WARNING',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'primary',
                            callback: modal => window.CustomDialog.closeModal(modal)
                        }
                    ]
                });
                return;
            }

            // Set the flag to prevent duplicate submissions
            isSubmitting = true;
            console.log('Starting booking submission, isSubmitting =', isSubmitting);

            const bookings = Array.from(selectedCells).map(cell => {
                const timeSlot = cell.closest('tr').querySelector('.time-slot').textContent;
                const roomHeader = bookingTable.querySelector('thead tr').children[cell.cellIndex].textContent;

                // Format time slot to match the expected format (HH:MM am/pm)
                let formattedTimeSlot = timeSlot
                    .toLowerCase()
                    .replace(/\./g, ':')
                    .replace(/p\.m\.|p:m:/, 'pm')
                    .replace(/a\.m\.|a:m:/, 'am')
                    .trim();

                // Ensure proper format with a colon between hours and minutes
                let timeParts = formattedTimeSlot.match(/(\d+)[:\.]?(\d*)[\s]*(am|pm)/i);
                if (timeParts) {
                    let hours = timeParts[1];
                    let minutes = timeParts[2] || '00';
                    let period = timeParts[3].toLowerCase();

                    // Pad minutes with leading zero if needed
                    if (minutes.length === 1) minutes = '0' + minutes;

                    formattedTimeSlot = `${hours}:${minutes} ${period}`;
                }

                // Get the selected date from the URL
                const urlParams = new URLSearchParams(window.location.search);
                const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

                return {
                    floor: floorSlug,
                    room: roomHeader.trim(),
                    time_slot: formattedTimeSlot,
                    reason: reason,
                    date: selectedDate
                };
            });

            try {
                const response = await fetch('/booking/save_booking/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(bookings)
                });

                const data = await response.json();
                if (data.status === 'success') {
                    // Update the cells to show they're booked
                    selectedCells.forEach(cell => {
                        cell.classList.remove('selected');
                        cell.classList.add('booked');
                        cell.style.backgroundColor = '#f3f4f6';
                        cell.style.color = '#374151';
                        cell.style.cursor = 'not-allowed';
                        cell.innerHTML = `<span class="booked-text">Booked by: ${reason}</span>`;
                    });

                    // Reset the input
                    bookingReason.value = '';

                    // Show success message immediately
                    window.CustomDialog.showModal({
                        title: 'Booking Successful',
                        message: `Successfully booked ${selectedCells.length} slot(s) with reason "Booked by: ${reason}"`,
                        type: 'SUCCESS',
                        buttons: [
                            {
                                text: 'OK',
                                type: 'primary',
                                callback: modal => window.CustomDialog.closeModal(modal)
                            }
                        ]
                    });

                    // Log success details
                    console.log(`Successfully booked ${selectedCells.length} slots for reason: ${reason}`);
                } else if (data.status === 'login_required') {
                    window.location.href = '/login/?next=' + window.location.pathname;
                } else {
                    window.CustomDialog.showModal({
                        title: 'Booking Failed',
                        message: data.message || 'Failed to book the slots. Please try again.',
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
            } catch (error) {
                console.error('Error:', error);
                window.CustomDialog.showModal({
                    title: 'Error',
                    message: 'Failed to book the slots. Please try again.',
                    type: 'ERROR',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'primary',
                            callback: modal => window.CustomDialog.closeModal(modal)
                        }
                    ]
                });
            } finally {
                // Reset the submission flag regardless of success or failure
                isSubmitting = false;
                console.log('Booking submission completed, isSubmitting =', isSubmitting);
            }
        }; // No delay needed

        // Attach the handler to the button
        bookButtonRef.addEventListener('click', bookingHandler);
    }

    // Rest of the existing code...
    // [Previous addNewColumn, createNewColumn, getSuffix, saveColumnStructure functions remain unchanged]

    // Function to save selection state to localStorage
    function saveSelectionState() {
        try {
            const selectedCells = document.querySelectorAll('.booking-cell.selected');
            const selections = Array.from(selectedCells).map(cell => {
                return {
                    room: cell.dataset.room,
                    time: cell.dataset.time,
                    floor: floorSlug,
                    booked: cell.classList.contains('booked') || cell.dataset.booked === 'true'
                };
            });

            // Get the current date from the URL or use today's date
            const urlParams = new URLSearchParams(window.location.search);
            const currentDate = urlParams.get('date') || new Date().toISOString().split('T')[0];

            // Create a key that includes the floor and date
            const storageKey = `bookingSelections_${floorSlug}_${currentDate}`;

            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(selections));
            console.log(`Saved ${selections.length} selections to localStorage with key: ${storageKey}`);
        } catch (error) {
            console.error('Error saving selection state:', error);
        }
    }

    // Function to restore selection state from localStorage
    function restoreSelectionState() {
        try {
            // Get the current date from the URL or use today's date
            const urlParams = new URLSearchParams(window.location.search);
            const currentDate = urlParams.get('date') || new Date().toISOString().split('T')[0];

            // Create the storage key
            const storageKey = `bookingSelections_${floorSlug}_${currentDate}`;

            // Get saved selections from localStorage
            const savedSelectionsJson = localStorage.getItem(storageKey);
            if (!savedSelectionsJson) {
                console.log(`No saved selections found for key: ${storageKey}`);
                return;
            }

            const savedSelections = JSON.parse(savedSelectionsJson);
            console.log(`Restoring ${savedSelections.length} selections from localStorage`);

            // Find and select the cells
            savedSelections.forEach(selection => {
                const cells = document.querySelectorAll('.booking-cell');
                cells.forEach(cell => {
                    if (cell.dataset.room === selection.room &&
                        cell.dataset.time === selection.time &&
                        floorSlug === selection.floor) {

                        // Check if the cell is booked
                        const isBooked = cell.classList.contains('booked') || cell.dataset.booked === 'true';

                        // Check if user is admin
                        const isAdmin = window.isUserAdmin;

                        // Only select if not booked or if admin
                        if (!isBooked || (isBooked && isAdmin)) {
                            cell.classList.add('selected');

                            // Apply appropriate styling
                            if (isBooked && isAdmin) {
                                // Special styling for booked cells selected by admin
                                cell.style.backgroundColor = '#ffcccc';
                                cell.style.color = '#333';
                                cell.style.border = '2px solid #ff6666';
                                cell.style.cursor = 'pointer';

                                // Make any text inside the cell visible
                                const textElements = cell.querySelectorAll('span');
                                textElements.forEach(el => {
                                    el.style.color = '#333';
                                });
                            } else if (!isBooked) {
                                // Normal styling for unbooked selected cells
                                cell.style.backgroundColor = '#1e40af';
                                cell.style.color = 'white';
                            }

                            console.log(`Restored selection for ${selection.room} at ${selection.time}`);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error restoring selection state:', error);
        }
    }

    // Initialize the cell selection functionality
    initializeCellSelection();

    // Restore any saved selections
    setTimeout(() => {
        restoreSelectionState();
    }, 500);

    // Save selections when they change
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('booking-cell')) {
            setTimeout(() => {
                saveSelectionState();
            }, 100);
        }
    });

    // Add column functionality
    if (addColumnBtn && bookingTable) {
        // Remove any existing click listeners
        const newAddColumnBtn = addColumnBtn.cloneNode(true);
        addColumnBtn.parentNode.replaceChild(newAddColumnBtn, addColumnBtn);

        // Add debounced click handler
        const debouncedAddColumn = debounce((e) => {
            e.preventDefault();
            e.stopPropagation();
            addNewColumn();
            // Reinitialize cell selection for new cells
            initializeCellSelection();
        }, 300);

        newAddColumnBtn.addEventListener('click', debouncedAddColumn);
    }

    function addNewColumn() {
        if (!currentFloor) {
            console.error('Current floor information not found');
            return;
        }

        // Get all existing room headers
        const headers = Array.from(document.querySelectorAll('.room-header'))
            .map(header => header.textContent.trim());

        // Extract floor number from currentFloor (e.g., "1st Floor" -> 1)
        const floorMatch = currentFloor.match(/(\d+)(?:st|nd|rd|th)/);
        if (!floorMatch) {
            console.error('Invalid floor format');
            return;
        }
        const floorNumber = parseInt(floorMatch[1]);

        // Filter headers for current floor only
        const currentFloorRooms = headers.filter(header => {
            const match = header.match(/Meeting Room (\d+) - (\d+)(?:st|nd|rd|th) Floor/);
            return match && parseInt(match[2]) === floorNumber;
        });

        let roomName;
        if (currentFloorRooms.length === 0) {
            // No rooms exist for this floor, create first room
            roomName = `Meeting Room 1 - ${floorNumber}${getSuffix(floorNumber)} Floor`;
        } else {
            // Find highest room number for this floor
            const roomNumbers = currentFloorRooms.map(header => {
                const match = header.match(/Meeting Room (\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
            const nextRoomNumber = Math.max(...roomNumbers) + 1;
            roomName = `Meeting Room ${nextRoomNumber} - ${floorNumber}${getSuffix(floorNumber)} Floor`;
        }

        createNewColumn(roomName);
        saveColumnStructure();
    }

    function createNewColumn(roomName) {
        // Add header
        const headerRow = bookingTable.querySelector('thead tr');
        const newHeader = document.createElement('th');
        newHeader.className = 'text-center room-header selectable-header';
        newHeader.textContent = roomName;
        headerRow.appendChild(newHeader);

        // Add cells for each time slot
        const rows = bookingTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const newCell = document.createElement('td');
            newCell.className = 'booking-cell';
            row.appendChild(newCell);
        });
    }

    function getSuffix(num) {
        if (num === 1) return 'st';
        if (num === 2) return 'nd';
        if (num === 3) return 'rd';
        return 'th';
    }

    function saveColumnStructure() {
        if (!floorSlug) {
            console.error('Floor slug not found');
            return;
        }

        const headers = Array.from(document.querySelectorAll('.room-header'))
            .map(header => header.textContent.trim());

        fetch('/booking/save_columns/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                floor_slug: floorSlug,
                rooms: headers
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Column structure saved successfully');
            } else {
                console.error('Failed to save column structure:', data.message);
            }
        })
        .catch(error => {
            console.error('Error saving column structure:', error);
        });
    }

    // Helper function to get CSRF token
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

    // Custom dialog functions are now provided by the custom-dialog.js file

    // Add event listener for the 'Delete Slot' button
    // const deleteSlotBtn = document.getElementById('deleteSlotBtn');
    // if (deleteSlotBtn) {
    //     deleteSlotBtn.addEventListener('click', async function(event) {
    //         event.preventDefault(); // Prevent default link behavior

    //         const selectedCells = document.querySelectorAll('.booking-cell.selected');
    //         if (selectedCells.length === 0) {
    //             window.CustomDialog.showModal({
    //                 title: 'No Selection',
    //                 message: 'Please select at least one slot to delete',
    //                 type: 'WARNING',
    //                 buttons: [
    //                     {
    //                         text: 'OK',
    //                         type: 'primary',
    //                         callback: modal => window.CustomDialog.closeModal(modal)
    //                     }
    //                 ]
    //             });
    //             return;
    //         }

    //         const slotsToDelete = Array.from(selectedCells).map(cell => {
    //             const timeSlot = cell.closest('tr').querySelector('.time-slot').textContent;
    //             const roomHeader = bookingTable.querySelector('thead tr').children[cell.cellIndex].textContent;

    //             // Format time slot to match the expected format (HH:MM am/pm)
    //             let formattedTimeSlot = timeSlot
    //                 .toLowerCase()
    //                 .replace(/\./g, ':')
    //                 .replace(/p\.m\.|p:m:/, 'pm')
    //                 .replace(/a\.m\.|a:m:/, 'am')
    //                 .trim();

    //             // Ensure proper format with a colon between hours and minutes
    //             let timeParts = formattedTimeSlot.match(/(\d+)[:\.]?(\d*)[\s]*(am|pm)/i);
    //             if (timeParts) {
    //                 let hours = timeParts[1];
    //                 let minutes = timeParts[2] || '00';
    //                 let period = timeParts[3].toLowerCase();

    //                 // Pad minutes with leading zero if needed
    //                 if (minutes.length === 1) minutes = '0' + minutes;

    //                 formattedTimeSlot = `${hours}:${minutes} ${period}`;
    //             }

    //             // Get the selected date from the URL
    //             const urlParams = new URLSearchParams(window.location.search);
    //             const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    //             // Create the slot data with both time and time_slot fields for compatibility
    //             return {
    //                 floor: floorSlug,
    //                 room: roomHeader.trim(),
    //                 time_slot: formattedTimeSlot,
    //                 time: formattedTimeSlot,  // Add time field for backward compatibility
    //                 date: selectedDate  // Include the date
    //             };
    //         });

    //         try {
    //             const response = await fetch('/booking/delete_slots/', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'X-CSRFToken': getCookie('csrftoken')
    //                 },
    //                 body: JSON.stringify(slotsToDelete)
    //             });

    //             const data = await response.json();
    //             if (data.status === 'success') {
    //                 // Remove the selected cells from the UI
    //                 selectedCells.forEach(cell => {
    //                     cell.classList.remove('selected');
    //                     cell.classList.remove('booked');
    //                     cell.style.backgroundColor = '';
    //                     cell.style.color = '';
    //                     cell.style.cursor = 'pointer';
    //                     cell.innerHTML = '';
    //                 });

    //                 // Show success message
    //                 window.CustomDialog.showModal({
    //                     title: 'Deletion Successful',
    //                     message: `Successfully deleted ${selectedCells.length} slot(s)`,
    //                     type: 'SUCCESS',
    //                     buttons: [
    //                         {
    //                             text: 'OK',
    //                             type: 'primary',
    //                             callback: modal => window.CustomDialog.closeModal(modal)
    //                         }
    //                     ]
    //                 });

    //                 // Log success details
    //                 console.log(`Successfully deleted ${selectedCells.length} slots`);
    //             } else {
    //                 window.CustomDialog.showModal({
    //                     title: 'Deletion Failed',
    //                     message: data.message || 'Failed to delete the slots. Please try again.',
    //                     type: 'ERROR',
    //                     buttons: [
    //                         {
    //                             text: 'OK',
    //                             type: 'primary',
    //                             callback: modal => window.CustomDialog.closeModal(modal)
    //                         }
    //                     ]
    //                 });
    //             }
    //         } catch (error) {
    //             console.error('Error:', error);
    //             window.CustomDialog.showModal({
    //                 title: 'Error',
    //                 message: 'Failed to delete the slots. Please try again.',
    //                 type: 'ERROR',
    //                 buttons: [
    //                     {
    //                         text: 'OK',
    //                         type: 'primary',
    //                         callback: modal => window.CustomDialog.closeModal(modal)
    //                     }
    //                 ]
    //             });
    //         }
    //     });
    // }

    // // Log the booking data being rendered
    // // Get the booking data from the JSON script tag
    // try {
    //     const bookedSlotsDataElement = document.getElementById('booked_slots_data');
    //     if (bookedSlotsDataElement) {
    //         try {
    //             // First try to parse as JSON
    //             let textContent = bookedSlotsDataElement.textContent.trim();

    //             // Log the raw content for debugging
    //             console.log('Raw booked_slots_data content:', textContent);

    //             // Handle potential JSON issues
    //             if (textContent.startsWith("'") || textContent.startsWith('"')) {
    //                 // Remove any surrounding quotes that might be causing issues
    //                 textContent = textContent.replace(/^['"]|['"]$/g, '');
    //             }

    //             const bookedSlots = JSON.parse(textContent);
    //             console.log('Rendering booking data:', bookedSlots);
    //             window.bookedSlots = bookedSlots; // Store in global scope for other functions

    //             // Log each booking in detail for debugging
    //             console.log('Detailed booking data:');
    //             for (const room in bookedSlots) {
    //                 console.log(`- Room: "${room}"`);
    //                 for (const timeKey in bookedSlots[room]) {
    //                     const booking = bookedSlots[room][timeKey];
    //                     console.log(`  - Time: "${timeKey}" -> Reason: "${booking.reason}"`);
    //                 }
    //             }
    //         } catch (jsonError) {
    //             // If JSON parsing fails, log the error but don't throw an exception
    //             console.error('Error parsing booking data as JSON:', jsonError);
    //             console.log('Raw booking data:', bookedSlotsDataElement.textContent);
    //             // Initialize empty object to prevent further errors
    //             window.bookedSlots = {};
    //         }
    //     } else {
    //         console.log('Rendering booking data: Booking data not available');
    //         window.bookedSlots = {};
    //     }
    // } catch(e) {
    //     console.error('Error accessing booking data:', e);
    //     window.bookedSlots = {};
    // }


    // Initialize delete slot functionality
    const deleteSlotBtn = document.getElementById('deleteSlotBtn');
    if (deleteSlotBtn) {
        deleteSlotBtn.addEventListener('click', async function(event) {
            event.preventDefault(); // Prevent default link behavior

            const selectedCells = document.querySelectorAll('.booking-cell.selected');
            if (selectedCells.length === 0) {
                window.CustomDialog.showModal({
                    title: 'No Selection',
                    message: 'Please select at least one slot to delete',
                    type: 'WARNING',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'primary',
                            callback: modal => window.CustomDialog.closeModal(modal)
                        }
                    ]
                });
                return;
            }

            // Create a custom confirmation dialog with fade-out animation
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay delete-confirmation-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '9999';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';

            const modal = document.createElement('div');
            modal.className = 'custom-modal delete-confirmation-modal';
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
            modal.style.backgroundColor = '#fff';
            modal.style.borderRadius = '5px';
            modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
            modal.style.zIndex = '10000';
            modal.style.minWidth = '300px';
            modal.style.maxWidth = '400px';
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            modal.style.overflow = 'hidden';

            // Create header with warning icon
            const headerContainer = document.createElement('div');
            headerContainer.style.backgroundColor = '#FF9800'; // Orange color for warning
            headerContainer.style.color = 'white';
            headerContainer.style.padding = '15px 20px';
            headerContainer.style.display = 'flex';
            headerContainer.style.alignItems = 'center';

            // Create warning icon
            const warningIcon = document.createElement('div');
            warningIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
            `;
            warningIcon.style.marginRight = '10px';

            // Create title
            const titleElement = document.createElement('h2');
            titleElement.textContent = 'Confirm Deletion';
            titleElement.style.margin = '0';
            titleElement.style.fontSize = '18px';
            titleElement.style.fontWeight = '500';

            // Assemble header
            headerContainer.appendChild(warningIcon);
            headerContainer.appendChild(titleElement);

            // Create message container
            const contentContainer = document.createElement('div');
            contentContainer.style.padding = '15px 20px';
            contentContainer.style.backgroundColor = '#fff';

            // Create message
            const messageElement = document.createElement('p');
            messageElement.textContent = `Are you sure you want to delete ${selectedCells.length} slot(s)?`;
            messageElement.style.margin = '0';
            messageElement.style.fontSize = '16px';
            messageElement.style.color = '#333';

            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.justifyContent = 'flex-end';
            buttonsContainer.style.marginTop = '15px';
            buttonsContainer.style.gap = '10px';

            // Create cancel button
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.style.padding = '6px 15px';
            cancelButton.style.backgroundColor = '#f5f5f5';
            cancelButton.style.color = '#333';
            cancelButton.style.border = '1px solid #ddd';
            cancelButton.style.borderRadius = '4px';
            cancelButton.style.cursor = 'pointer';
            cancelButton.style.fontSize = '14px';
            cancelButton.style.fontWeight = '500';

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.padding = '6px 15px';
            deleteButton.style.backgroundColor = '#FF9800'; // Orange for warning
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.borderRadius = '4px';
            deleteButton.style.cursor = 'pointer';
            deleteButton.style.fontSize = '14px';
            deleteButton.style.fontWeight = '500';

            // Add event listeners with fade-out animation
            cancelButton.addEventListener('click', function() {
                // Add fade-out animation
                modal.style.opacity = '0';
                modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
                overlay.style.opacity = '0';

                // Remove elements after animation completes
                setTimeout(function() {
                    // Remove any existing confirmation dialogs
                    const existingConfirmationModals = document.querySelectorAll('.delete-confirmation-modal, .delete-confirmation-overlay');
                    existingConfirmationModals.forEach(element => {
                        if (document.body.contains(element)) {
                            document.body.removeChild(element);
                        }
                    });

                    // Also remove our specific modal and overlay
                    if (document.body.contains(modal)) document.body.removeChild(modal);
                    if (document.body.contains(overlay)) document.body.removeChild(overlay);
                }, 300);
            });

            deleteButton.addEventListener('click', function() {
                // Add fade-out animation
                modal.style.opacity = '0';
                modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
                overlay.style.opacity = '0';

                // Remove elements after animation completes and then proceed with deletion
                setTimeout(async function() {
                    // First, remove any existing confirmation dialogs to prevent stacking
                    const existingConfirmationModals = document.querySelectorAll('.delete-confirmation-modal, .delete-confirmation-overlay');
                    existingConfirmationModals.forEach(element => {
                        if (document.body.contains(element)) {
                            document.body.removeChild(element);
                        }
                    });

                    // Then remove our specific modal and overlay
                    if (document.body.contains(modal)) document.body.removeChild(modal);
                    if (document.body.contains(overlay)) document.body.removeChild(overlay);

                    // This is the confirm callback — proceed with deletion here
                    const slotsToDelete = Array.from(selectedCells).map(cell => {
                        const timeSlot = cell.closest('tr').querySelector('.time-slot').textContent;
                        const roomHeader = bookingTable.querySelector('thead tr').children[cell.cellIndex].textContent;

                        // Format time slot
                        let formattedTimeSlot = timeSlot
                            .toLowerCase()
                            .replace(/\./g, ':')
                            .replace(/p\.m\.|p:m:/, 'pm')
                            .replace(/a\.m\.|a:m:/, 'am')
                            .trim();

                        let timeParts = formattedTimeSlot.match(/(\d+)[:\.]?(\d*)[\s]*(am|pm)/i);
                        if (timeParts) {
                            let hours = timeParts[1];
                            let minutes = timeParts[2] || '00';
                            let period = timeParts[3].toLowerCase();
                            if (minutes.length === 1) minutes = '0' + minutes;
                            formattedTimeSlot = `${hours}:${minutes} ${period}`;
                        }

                        const urlParams = new URLSearchParams(window.location.search);
                        const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0];

                        return {
                            floor: floorSlug,
                            room: roomHeader.trim(),
                            time_slot: formattedTimeSlot,
                            time: formattedTimeSlot,
                            date: selectedDate
                        };
                    });

                    try {
                        const response = await fetch('/booking/delete_slots/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify(slotsToDelete)
                        });

                        const data = await response.json();
                        if (data.status === 'success') {
                            // Store the deletion timestamp in localStorage to trigger updates in other tabs
                            if (data.deletion_timestamp) {
                                localStorage.setItem('lastDeletionTimestamp', data.deletion_timestamp);
                                console.log(`Set deletion timestamp: ${data.deletion_timestamp}`);
                            }

                            // Clear any cached booking data
                            if (window.bookedSlots) {
                                // First, use the slots we sent to delete
                                slotsToDelete.forEach(slot => {
                                    if (window.bookedSlots[slot.room] &&
                                        window.bookedSlots[slot.room][slot.time_slot]) {
                                        delete window.bookedSlots[slot.room][slot.time_slot];
                                        console.log(`Removed ${slot.room} at ${slot.time_slot} from cached data`);
                                    }
                                });

                                // Then, use the detailed deleted_slots data from the server response
                                if (data.deleted_slots && Array.isArray(data.deleted_slots)) {
                                    data.deleted_slots.forEach(slot => {
                                        if (window.bookedSlots[slot.room] &&
                                            window.bookedSlots[slot.room][slot.time_slot]) {
                                            delete window.bookedSlots[slot.room][slot.time_slot];
                                            console.log(`Removed server-reported slot: ${slot.room} at ${slot.time_slot} from cached data`);
                                        }
                                    });
                                }
                            }

                            // Also clear any global selection tracking variables
                            if (window.selectedCells) {
                                window.selectedCells = [];
                            }

                            // Clear any saved selection state from localStorage
                            try {
                                // Get the current date from the URL or use today's date
                                const urlParams = new URLSearchParams(window.location.search);
                                const currentDate = urlParams.get('date') || new Date().toISOString().split('T')[0];

                                // Create the storage key
                                const storageKey = `bookingSelections_${floorSlug}_${currentDate}`;

                                // Remove the saved selections
                                localStorage.removeItem(storageKey);
                                console.log(`Cleared saved selections from localStorage for key: ${storageKey}`);
                            } catch (error) {
                                console.error('Error clearing selection state:', error);
                            }

                            // Update the UI
                            selectedCells.forEach(cell => {
                                cell.classList.remove('selected');
                                cell.classList.remove('booked');
                                cell.style.backgroundColor = '';
                                cell.style.color = '';
                                cell.style.cursor = 'pointer';
                                cell.innerHTML = '';

                                // Also update data attributes to ensure fresh state
                                cell.removeAttribute('data-booked');
                                cell.dataset.booked = 'false';
                            });

                            // Add a small delay before showing the success dialog to ensure the confirmation dialog is gone
                            setTimeout(() => {
                                window.CustomDialog.showModal({
                                    title: 'Deletion Successful',
                                    message: `Successfully deleted ${selectedCells.length} slot(s)`,
                                    type: 'SUCCESS',
                                    buttons: [
                                        {
                                            text: 'OK',
                                            type: 'primary',
                                            callback: modal => {
                                                window.CustomDialog.closeModal(modal);
                                                // Force a page refresh to ensure clean state
                                                window.location.reload();
                                            }
                                        }
                                    ]
                                });
                            }, 100);

                            console.log(`Successfully deleted ${selectedCells.length} slots`);
                        } else {
                            // Add a small delay before showing the error dialog
                            setTimeout(() => {
                                window.CustomDialog.showModal({
                                    title: 'Deletion Failed',
                                    message: data.message || 'Failed to delete the slots. Please try again.',
                                    type: 'ERROR',
                                    buttons: [
                                        {
                                            text: 'OK',
                                            type: 'primary',
                                            callback: modal => window.CustomDialog.closeModal(modal)
                                        }
                                    ]
                                });
                            }, 100);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        // Add a small delay before showing the error dialog
                        setTimeout(() => {
                            window.CustomDialog.showModal({
                                title: 'Error',
                                message: 'Failed to delete the slots. Please try again.',
                                type: 'ERROR',
                                buttons: [
                                    {
                                        text: 'OK',
                                        type: 'primary',
                                        callback: modal => window.CustomDialog.closeModal(modal)
                                    }
                                ]
                            });
                        }, 100);
                    }
                }, 300);
            });

            // Assemble the modal
            buttonsContainer.appendChild(cancelButton);
            buttonsContainer.appendChild(deleteButton);
            contentContainer.appendChild(messageElement);
            contentContainer.appendChild(buttonsContainer);

            modal.appendChild(headerContainer);
            modal.appendChild(contentContainer);

            // Add to document
            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            // Add fade-in animation
            setTimeout(() => {
                overlay.style.opacity = '1';
                modal.style.opacity = '1';
                modal.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 50);
        });
    }

    // Add "Booked by" prefix to all existing booked cells on page load
    function addPrefixToExistingBookings() {
        document.querySelectorAll('.booking-cell .booked-text').forEach(el => {
            if (!el.textContent.trim().startsWith('Booked by:')) {
                el.textContent = `Booked by: ${el.textContent.trim()}`;
            }
        });
    }

    // Run the function after a short delay to ensure all elements are loaded
    setTimeout(addPrefixToExistingBookings, 500);
});
