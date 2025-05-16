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

    // Array to track selected cells for deletion
    let selectedCellsArray = [];

    // We don't need to add event listeners to headers here since booking_with_approval.js handles that
    // Instead, we'll just set up a MutationObserver to track when headers get the 'selected' class
    if (bookingTable) {
        console.log("Setting up MutationObserver for header and cell selection in admin_options.js");

        // Create a MutationObserver to watch for changes to the 'selected' class on headers and cells
        const selectionObserver = new MutationObserver(function(mutations) {
            let selectionChanged = false;

            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const element = mutation.target;

                    // Handle header selection
                    if (element.tagName === 'TH') {
                        // If this header now has the 'selected' class, update our selectedHeader
                        if (element.classList.contains('selected')) {
                            selectedHeader = element;
                            console.log('Admin options detected selected header:', element.textContent);
                        }
                        // If this was our selected header and it lost the 'selected' class, clear our reference
                        else if (selectedHeader === element) {
                            selectedHeader = null;
                            console.log('Admin options detected header deselection');
                        }
                    }

                    // Handle cell selection
                    if (element.tagName === 'TD' && element.classList.contains('booking-cell')) {
                        selectionChanged = true;
                    }
                }
            });

            // If any cell selection changed, update our array from the DOM
            if (selectionChanged) {
                // Use a small delay to ensure all DOM updates have been applied
                setTimeout(() => {
                    // Get all currently selected cells from the DOM
                    const selectedCells = document.querySelectorAll('td.booking-cell.selected');
                    selectedCellsArray = Array.from(selectedCells);
                    console.log('Updated selected cells array. New count:', selectedCellsArray.length);

                    // Debug: Log all selected cells
                    if (selectedCellsArray.length > 0) {
                        console.log("Currently selected cells:");
                        selectedCellsArray.forEach((cell, idx) => {
                            console.log(`Cell ${idx + 1}:`, {
                                room: cell.dataset.room,
                                time: cell.dataset.time,
                                booked: cell.classList.contains('booked')
                            });
                        });
                    }
                }, 50); // Small delay to ensure DOM is updated
            }
        });

        // Observe all headers
        const headers = bookingTable.querySelectorAll('th.room-header, th.selectable-header');
        headers.forEach(header => {
            selectionObserver.observe(header, { attributes: true });

            // Check if any header is already selected when the page loads
            if (header.classList.contains('selected')) {
                selectedHeader = header;
                console.log('Admin options found pre-selected header:', header.textContent);
            }
        });

        // Observe all booking cells
        const cells = bookingTable.querySelectorAll('td.booking-cell');
        cells.forEach(cell => {
            selectionObserver.observe(cell, { attributes: true });
        });

        // Get all currently selected cells from the DOM
        const selectedCells = document.querySelectorAll('td.booking-cell.selected');
        selectedCellsArray = Array.from(selectedCells);

        // Log initial selection state
        if (selectedCellsArray.length > 0) {
            console.log('Initial selected cells found:', selectedCellsArray.length);
            selectedCellsArray.forEach((cell, index) => {
                console.log(`Pre-selected cell ${index + 1}:`, {
                    room: cell.dataset.room,
                    time: cell.dataset.time
                });
            });
        } else {
            console.log('No cells selected initially');
        }

        // Add a direct click handler to all booking cells to ensure we're capturing all selection events
        // This is a backup to the MutationObserver
        bookingTable.addEventListener('click', function() {
            // Use a small delay to ensure the booking_with_approval.js click handler has run
            setTimeout(() => {
                // Get all currently selected cells from the DOM
                const currentSelectedCells = document.querySelectorAll('td.booking-cell.selected');
                const newSelectedCellsArray = Array.from(currentSelectedCells);

                // Only update if there's a change
                if (newSelectedCellsArray.length !== selectedCellsArray.length) {
                    console.log('Cell selection changed via click. New count:', newSelectedCellsArray.length);
                    selectedCellsArray = newSelectedCellsArray;

                    // Debug: Log all selected cells
                    if (selectedCellsArray.length > 0) {
                        console.log("Currently selected cells after click:");
                        selectedCellsArray.forEach((cell, idx) => {
                            console.log(`Cell ${idx + 1}:`, {
                                room: cell.dataset.room,
                                time: cell.dataset.time,
                                booked: cell.classList.contains('booked')
                            });
                        });
                    }
                }
            }, 100); // Small delay to ensure booking_with_approval.js has processed the click
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

            // IMPORTANT: Always get the current selection directly from the DOM
            // This ensures we have the most up-to-date selection regardless of any tracking issues
            const selectedCells = Array.from(document.querySelectorAll('td.booking-cell.selected'));
            console.log("Found selected cells:", selectedCells.length);

            // Force update our tracking array
            selectedCellsArray = selectedCells;

            // Debug: Log all selected cells with detailed information
            if (selectedCells.length > 0) {
                console.log("Selected cells details:");
                selectedCells.forEach((cell, idx) => {
                    console.log(`Cell ${idx + 1}:`, {
                        room: cell.dataset.room,
                        time: cell.dataset.time,
                        floor: cell.dataset.floor,
                        classes: cell.className,
                        booked: cell.classList.contains('booked'),
                        html: cell.outerHTML.substring(0, 100) // Log first 100 chars of HTML
                    });
                });
            }

            // Check if any cell is selected
            if (selectedCells.length === 0) {
                showErrorPopup('No Selection', 'Please select at least one slot to delete');
                return;
            }

            // Filter out only booked cells
            const bookedCells = selectedCells.filter(cell => cell.classList.contains('booked'));
            console.log("Booked cells count:", bookedCells.length);

            if (bookedCells.length === 0) {
                showErrorPopup('No Selection', 'Please select at least one slot to delete');
                return;
            }

            // Log details of all selected booked cells that will be deleted
            console.log("Selected cells for deletion:");
            bookedCells.forEach((cell) => {
                console.log(`Selected cell for deletion:`, {
                    room: cell.dataset.room,
                    time: cell.dataset.time,
                    floor: cell.dataset.floor,
                    booked: cell.classList.contains('booked')
                });

                // Log the actual HTML of the cell for debugging
                console.log("Cell classes:", cell.className);
                console.log("Cell data:", {
                    room: cell.dataset.room,
                    time: cell.dataset.time,
                    floor: cell.dataset.floor
                });
            });

            // Create confirmation message based on number of slots
            let confirmMessage = '';
            if (bookedCells.length === 1) {
                confirmMessage = `Are you sure you want to delete the selected booking?`;
            } else {
                confirmMessage = `Are you sure you want to delete ${bookedCells.length} selected bookings?`;
            }

            // Show confirmation popup
            showConfirmationPopup(
                'Delete Booking' + (bookedCells.length > 1 ? 's' : ''),
                confirmMessage,
                'Delete Booking' + (bookedCells.length > 1 ? 's' : ''),
                function() {
                    // Delete all selected booked cells
                    deleteMultipleBookings(bookedCells);
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

    // Function to delete multiple bookings
    function deleteMultipleBookings(cells) {
        if (!cells || cells.length === 0) {
            showErrorPopup('Error', 'No cells selected for deletion');
            return;
        }

        console.log(`Starting deletion of ${cells.length} cells:`, cells);

        // Get the date from the page
        const dateElement = document.querySelector('.date-display');
        let date;
        if (dateElement) {
            date = dateElement.dataset.date || dateElement.textContent.trim();
            console.log("Date from page:", date);
        } else {
            // Fallback to current date
            const today = new Date();
            date = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            console.warn("Date element not found, using current date:", date);
        }

        // Get the current floor name from the URL
        const pathParts = window.location.pathname.split('/');
        const floorSlug = pathParts[pathParts.length - 2]; // e.g., "1st-floor"
        console.log("Floor slug from URL:", floorSlug);

        // Get CSRF token
        const csrfToken = getCookie('csrftoken');
        console.log("CSRF token obtained:", csrfToken ? "Yes" : "No");

        // Show a loading message
        const loadingPopup = showLoadingPopup(
            'Deleting Bookings',
            `Deleting ${cells.length} booking${cells.length > 1 ? 's' : ''}...`
        );

        // Create a copy of the cells array to avoid modification issues during iteration
        const cellsToProcess = Array.from(cells);

        console.log(`Processing ${cellsToProcess.length} cells for deletion`);

        // Log each cell to be processed
        cellsToProcess.forEach((cell, idx) => {
            console.log(`Cell to process ${idx + 1}:`, {
                room: cell.dataset.room,
                time: cell.dataset.time,
                floor: cell.dataset.floor,
                booked: cell.classList.contains('booked'),
                html: cell.outerHTML.substring(0, 100) // Log first 100 chars of HTML
            });
        });

        // Process cells sequentially to avoid race conditions
        let processedCount = 0;
        let successCount = 0;
        let errorCount = 0;
        let results = [];

        // Function to process a single cell
        function processCell(index) {
            // If all cells have been processed, show results
            if (index >= cellsToProcess.length) {
                console.log(`All cells processed. Success: ${successCount}, Errors: ${errorCount}`);
                console.log("Deletion results:", results);

                // Remove the loading popup
                if (loadingPopup) {
                    document.body.removeChild(loadingPopup.popup);
                    document.body.removeChild(loadingPopup.overlay);
                }

                // Function to ensure UI is fully updated
                function updateUI() {
                    // Make sure all successfully processed cells are properly cleared
                    results.forEach(result => {
                        if (result.success && result.cell) {
                            // Double-check that the cell is properly cleared
                            result.cell.innerHTML = '';
                            result.cell.classList.remove('booked', 'pending', 'selected');
                            result.cell.style.backgroundColor = '';
                            result.cell.style.color = '';
                            result.cell.style.cursor = 'pointer';
                            result.cell.style.border = '1px solid #ccc';
                        }
                    });
                }

                // Show appropriate message based on results
                if (successCount === cellsToProcess.length) {
                    // All deletions were successful
                    showSuccessPopup(
                        'Success',
                        `Successfully deleted ${successCount} booking${successCount > 1 ? 's' : ''}`
                    );
                    // Update UI
                    updateUI();
                } else if (successCount > 0) {
                    // Some deletions were successful
                    showSuccessPopup(
                        'Partial Success',
                        `Successfully deleted ${successCount} booking${successCount > 1 ? 's' : ''}, but failed to delete ${errorCount} booking${errorCount > 1 ? 's' : ''}`
                    );
                    // Update UI
                    updateUI();
                } else {
                    // No deletions were successful
                    showErrorPopup(
                        'Error',
                        `Failed to delete any bookings. Please try again.`
                    );
                }
                return;
            }

            const cell = cellsToProcess[index];
            const room = cell.dataset.room;
            const timeSlot = cell.dataset.time;

            console.log(`Processing cell ${index + 1}/${cellsToProcess.length}:`, {
                room: room,
                time: timeSlot,
                date: date,
                floor: floorSlug
            });

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
                console.log(`Cell ${index + 1} response:`, data);

                if (data.status === 'success') {
                    // Clear the cell content and remove booked classes
                    cell.innerHTML = '';
                    cell.classList.remove('booked', 'pending', 'selected');
                    cell.style.backgroundColor = '';
                    cell.style.color = '';

                    // Make sure the cell is properly reset to its default state
                    // This ensures it looks like an empty cell without requiring a page refresh
                    cell.style.cursor = 'pointer';
                    cell.style.border = '1px solid #ccc';

                    // Remove from selected cells array
                    const arrayIndex = selectedCellsArray.indexOf(cell);
                    if (arrayIndex !== -1) {
                        selectedCellsArray.splice(arrayIndex, 1);
                    }

                    successCount++;
                    console.log(`Success count: ${successCount}`);
                    results.push({ success: true, cell: cell });
                } else {
                    console.error(`Error deleting booking ${index + 1}:`, data.message);
                    errorCount++;
                    results.push({ success: false, error: data.message, cell: cell });
                }

                // Process the next cell
                processedCount++;
                processCell(index + 1);
            })
            .catch(error => {
                console.error(`Error deleting booking ${index + 1}:`, error);
                errorCount++;
                results.push({ success: false, error: error.message, cell: cell });

                // Process the next cell
                processedCount++;
                processCell(index + 1);
            });
        }

        // Start processing the first cell
        processCell(0);
    }

    // Note: The deleteBooking function has been replaced by deleteMultipleBookings
    // which can handle both single and multiple bookings

    // Helper function to show confirmation popup
    function showConfirmationPopup(title, message, confirmText, onConfirm) {
        // Create popup container
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '0';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '400px';
        popup.style.maxWidth = '500px';
        popup.style.overflow = 'hidden';

        // Create header with warning icon
        const headerContainer = document.createElement('div');
        headerContainer.style.backgroundColor = '#FF9800'; // Orange color for deletion warning
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
        titleElement.textContent = title.includes('Delete') ? 'Confirm Deletion' : title;
        titleElement.style.margin = '0';
        titleElement.style.fontSize = '18px';
        titleElement.style.fontWeight = '500';

        // Assemble header
        headerContainer.appendChild(warningIcon);
        headerContainer.appendChild(titleElement);

        // Create message container
        const contentContainer = document.createElement('div');
        contentContainer.style.padding = '20px';
        contentContainer.style.backgroundColor = '#fff';

        // Create message
        const messageElement = document.createElement('p');

        // Customize message for slot deletion
        if (message.includes('delete') && message.includes('booking')) {
            if (message.includes('selected bookings')) {
                // Extract the number from the message
                const numMatch = message.match(/delete (\d+) selected/);
                const numSlots = numMatch ? numMatch[1] : '?';
                messageElement.textContent = `Are you sure you want to delete ${numSlots} slot(s)?`;
            } else {
                messageElement.textContent = 'Are you sure you want to delete this slot?';
            }
        } else {
            messageElement.textContent = message;
        }

        messageElement.style.margin = '0 0 20px 0';
        messageElement.style.fontSize = '16px';
        messageElement.style.color = '#333';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'flex-end';
        buttonsContainer.style.gap = '10px';

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.backgroundColor = '#f5f5f5';
        cancelButton.style.color = '#333';
        cancelButton.style.border = '1px solid #ddd';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.fontSize = '14px';

        // Create delete button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = confirmText.includes('Delete') ? 'Delete' : confirmText;
        confirmButton.style.padding = '8px 16px';
        confirmButton.style.backgroundColor = '#FF9800'; // Orange for delete
        confirmButton.style.color = 'white';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '4px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.fontSize = '14px';

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
            // Add fade-out animation
            popup.style.transition = 'opacity 0.2s ease-out';
            overlay.style.transition = 'opacity 0.2s ease-out';
            popup.style.opacity = '0';
            overlay.style.opacity = '0';

            // Remove elements after animation completes
            setTimeout(function() {
                if (document.body.contains(popup)) document.body.removeChild(popup);
                if (document.body.contains(overlay)) document.body.removeChild(overlay);
                onConfirm();
            }, 200);
        });

        cancelButton.addEventListener('click', function() {
            // Add fade-out animation
            popup.style.transition = 'opacity 0.2s ease-out';
            overlay.style.transition = 'opacity 0.2s ease-out';
            popup.style.opacity = '0';
            overlay.style.opacity = '0';

            // Remove elements after animation completes
            setTimeout(function() {
                if (document.body.contains(popup)) document.body.removeChild(popup);
                if (document.body.contains(overlay)) document.body.removeChild(overlay);
            }, 200);
        });

        // Assemble popup
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(confirmButton);
        contentContainer.appendChild(messageElement);
        contentContainer.appendChild(buttonsContainer);

        popup.appendChild(headerContainer);
        popup.appendChild(contentContainer);

        // Add to document
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // Add fade-in animation
        popup.style.opacity = '0';
        overlay.style.opacity = '0';
        popup.style.transition = 'opacity 0.3s ease-in';
        overlay.style.transition = 'opacity 0.3s ease-in';

        // Trigger reflow to ensure the transition works
        void popup.offsetWidth;

        // Set opacity to 1 to fade in
        popup.style.opacity = '1';
        overlay.style.opacity = '1';
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
        popup.style.padding = '0';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '300px';
        popup.style.maxWidth = '400px';
        popup.style.overflow = 'hidden';

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
        titleElement.textContent = title === 'No Slot Selected' ? 'No Selection' : title;
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
        messageElement.textContent = message === 'Please select at least one booked slot first.' ?
            'Please select at least one slot to delete' : message;
        messageElement.style.margin = '0';
        messageElement.style.fontSize = '16px';
        messageElement.style.color = '#333';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'flex-end';
        buttonsContainer.style.marginTop = '15px';

        // Create OK button
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.padding = '6px 15px';
        okButton.style.backgroundColor = '#FF9800'; // Orange for warning
        okButton.style.color = 'white';
        okButton.style.border = 'none';
        okButton.style.borderRadius = '4px';
        okButton.style.cursor = 'pointer';
        okButton.style.fontSize = '14px';
        okButton.style.fontWeight = '500';

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
        okButton.addEventListener('click', function() {
            // Add fade-out animation
            popup.style.transition = 'opacity 0.2s ease-out';
            overlay.style.transition = 'opacity 0.2s ease-out';
            popup.style.opacity = '0';
            overlay.style.opacity = '0';

            // Remove elements after animation completes
            setTimeout(function() {
                if (document.body.contains(popup)) document.body.removeChild(popup);
                if (document.body.contains(overlay)) document.body.removeChild(overlay);
            }, 200);
        });

        // Assemble popup
        buttonsContainer.appendChild(okButton);
        contentContainer.appendChild(messageElement);
        contentContainer.appendChild(buttonsContainer);

        popup.appendChild(headerContainer);
        popup.appendChild(contentContainer);

        // Add to document
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // Add fade-in animation
        popup.style.opacity = '0';
        overlay.style.opacity = '0';
        popup.style.transition = 'opacity 0.3s ease-in';
        overlay.style.transition = 'opacity 0.3s ease-in';

        // Trigger reflow to ensure the transition works
        void popup.offsetWidth;

        // Set opacity to 1 to fade in
        popup.style.opacity = '1';
        overlay.style.opacity = '1';
    }

    // Helper function to show success popup
    function showSuccessPopup(title, message) {
        // Check if this is a deletion success message
        const isDeletionSuccess = message.includes('deleted');

        // Create popup container
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '0';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '300px';
        popup.style.maxWidth = '400px';
        popup.style.overflow = 'hidden';

        if (isDeletionSuccess) {
            // Create header with success icon for deletion success
            const headerContainer = document.createElement('div');
            headerContainer.style.backgroundColor = '#4CAF50'; // Green color for success
            headerContainer.style.color = 'white';
            headerContainer.style.padding = '15px 20px';
            headerContainer.style.display = 'flex';
            headerContainer.style.alignItems = 'center';

            // Create success icon (white checkmark)
            const successIcon = document.createElement('div');
            successIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
            `;
            successIcon.style.marginRight = '10px';

            // Create title
            const titleElement = document.createElement('h2');
            titleElement.textContent = 'Deletion Successful';
            titleElement.style.margin = '0';
            titleElement.style.fontSize = '18px';
            titleElement.style.fontWeight = '500';

            // Assemble header
            headerContainer.appendChild(successIcon);
            headerContainer.appendChild(titleElement);

            // Create message container
            const contentContainer = document.createElement('div');
            contentContainer.style.padding = '15px 20px';
            contentContainer.style.backgroundColor = '#fff';

            // Create message
            const messageElement = document.createElement('p');
            messageElement.textContent = message;
            messageElement.style.margin = '0';
            messageElement.style.fontSize = '16px';
            messageElement.style.color = '#333';

            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.justifyContent = 'flex-end';
            buttonsContainer.style.marginTop = '15px';

            // Create OK button
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.style.padding = '6px 15px';
            okButton.style.backgroundColor = '#4CAF50'; // Green for success
            okButton.style.color = 'white';
            okButton.style.border = 'none';
            okButton.style.borderRadius = '4px';
            okButton.style.cursor = 'pointer';
            okButton.style.fontSize = '14px';
            okButton.style.fontWeight = '500';

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
            okButton.addEventListener('click', function() {
                // Add fade-out animation
                popup.style.transition = 'opacity 0.2s ease-out';
                overlay.style.transition = 'opacity 0.2s ease-out';
                popup.style.opacity = '0';
                overlay.style.opacity = '0';

                // Remove elements after animation completes
                setTimeout(function() {
                    if (document.body.contains(popup)) document.body.removeChild(popup);
                    if (document.body.contains(overlay)) document.body.removeChild(overlay);
                }, 200);
            });

            // Assemble popup
            buttonsContainer.appendChild(okButton);
            contentContainer.appendChild(messageElement);
            contentContainer.appendChild(buttonsContainer);

            popup.appendChild(headerContainer);
            popup.appendChild(contentContainer);

            // Add to document
            document.body.appendChild(overlay);
            document.body.appendChild(popup);

            // Add fade-in animation
            popup.style.opacity = '0';
            overlay.style.opacity = '0';
            popup.style.transition = 'opacity 0.3s ease-in';
            overlay.style.transition = 'opacity 0.3s ease-in';

            // Trigger reflow to ensure the transition works
            void popup.offsetWidth;

            // Set opacity to 1 to fade in
            popup.style.opacity = '1';
            overlay.style.opacity = '1';
        } else {
            // Use the original style for non-deletion success messages
            popup.style.padding = '30px';
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

