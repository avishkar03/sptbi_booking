// Booking with approval script
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ LOADED: booking_with_approval.js from booking/static/js/ directory");
    console.log("This is the 730-line version for restricted booking with approval");

    // Initialize booked slots data
    try {
        const bookedSlotsDataElement = document.getElementById('booked_slots_data');
        if (bookedSlotsDataElement) {
            try {
                // First try to parse as JSON
                const bookedSlots = JSON.parse(bookedSlotsDataElement.textContent);
                console.log('Successfully parsed booked slots data');
                window.bookedSlots = bookedSlots; // Store in global scope for other functions

                // Log each booking in detail for debugging
                console.log('Detailed booking data:');
                for (const room in bookedSlots) {
                    console.log(`- Room: "${room}"`);
                    for (const timeKey in bookedSlots[room]) {
                        const booking = bookedSlots[room][timeKey];
                        console.log(`  - Time: "${timeKey}" -> Reason: "${booking.reason}"`);
                    }
                }
            } catch (jsonError) {
                // If JSON parsing fails, log the error but don't throw an exception
                console.error('Error parsing booking data as JSON:', jsonError);
                console.log('Raw booking data:', bookedSlotsDataElement.textContent);
                // Initialize empty object to prevent further errors
                window.bookedSlots = {};
            }
        } else {
            console.log('Booked slots data element not found');
            window.bookedSlots = {};
        }
    } catch(e) {
        console.error('Error accessing booked slots data:', e);
        window.bookedSlots = {};
    }

    const bookingTable = document.querySelector('.booking-table');
    let selectedCells = []; // Array to store multiple selected cells

    // Add booking interface to the page if it doesn't exist
    if (!document.getElementById('bookingInterface')) {
        const bookingContainer = document.querySelector('.container-fluid');
        if (bookingContainer) {
            const bookingInterface = document.createElement('div');
            bookingInterface.id = 'bookingInterface';
            bookingInterface.className = 'booking-interface';
            bookingInterface.style.textAlign = 'center';
            bookingInterface.style.margin = '20px 0';
            bookingInterface.innerHTML = `
                <div class="booking-form" style="display: flex; flex-direction: column; align-items: center;">
                    <input type="text" id="bookingReason" style="width: 500px; height: 30px; padding: 5px; border: 1px solid #000; margin-bottom: 10px;" placeholder="Enter a reason in 4-5 words">
                    <button id="bookButton" style="width: 150px; height: 35px; background-color: #1e3a8a; color: white; border: none; cursor: pointer; transition: all 0.3s ease; font-weight: 700;">Book</button>
                </div>
            `;
            bookingContainer.appendChild(bookingInterface);
        }
    }

    const bookButton = document.getElementById('bookButton');
    const reasonInput = document.getElementById('bookingReason');

    // Add CSS for pending status and header selection
    const style = document.createElement('style');
    style.textContent = `
        .booking-cell.pending {
            background-color: #ffcccc !important;
            color: #990000 !important;
            cursor: not-allowed !important;
        }
        .booking-info.pending {
            color: #000000 !important; /* Changed to black */
            font-weight: 700 !important;
            font-family: Anuphan !important;
            font-size: 1rem !important;
        }
        .booking-cell.selected {
            background-color: #1e40af !important;
            color: white !important;
        }
        th.room-header.selected,
        th.selectable-header.selected {
            background-color: #1e40af !important;
            color: white !important;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // Check if user is admin
    const bookingContainer = document.getElementById('bookingContainer');
    const isAdmin = bookingContainer ? bookingContainer.dataset.isAdmin === 'true' : false;
    console.log("User is admin:", isAdmin);

    // Cell selection tracking
    let selectedHeader = null; // Track selected header

    // Add event listeners to column headers for selection
    if (bookingTable) {
        // First, remove any existing click handlers from admin_options.js
        // by cloning and replacing the headers
        const headers = bookingTable.querySelectorAll('th.room-header, th.selectable-header');

        console.log('Found headers:', headers.length);

        // Store a reference to the last clicked header timestamp to handle double clicks
        let lastClickedHeader = null;
        let lastClickTime = 0;

        // Add our own click handler to the document that will handle header clicks
        document.addEventListener('click', function(e) {
            // Find if a header was clicked
            const header = e.target.closest('th.room-header, th.selectable-header');
            if (!header) return; // Not a header click

            console.log('Header clicked:', header.textContent);
            console.log('Has selected class:', header.classList.contains('selected'));

            // Get current time for double-click detection
            const currentTime = new Date().getTime();

            // Check if this is a double click on the same header (within 300ms)
            if (lastClickedHeader === header && (currentTime - lastClickTime < 300)) {
                console.log('Double click detected - ignoring');
                return;
            }

            // Update last click tracking
            lastClickedHeader = header;
            lastClickTime = currentTime;

            // Stop event propagation to prevent other handlers from firing
            e.stopPropagation();

            // Toggle selection behavior - click once to select, click again to deselect
            if (header.classList.contains('selected')) {
                // If already selected, deselect it
                console.log('Deselecting header:', header.textContent);
                header.classList.remove('selected');
                selectedHeader = null;
            } else {
                // Clear previous selection from all headers
                headers.forEach(h => {
                    if (h !== header && h.classList.contains('selected')) {
                        console.log('Clearing selection from:', h.textContent);
                        h.classList.remove('selected');
                    }
                });

                // Select this header
                console.log('Selecting header:', header.textContent);
                header.classList.add('selected');
                selectedHeader = header;
            }

            console.log('Selected column:', selectedHeader ? selectedHeader.textContent : 'None');
        }, true); // Use capture phase to ensure our handler runs first
    }

    // Function to restore original styling for booked cells
    function restoreBookedCellStyling(cell) {
        if (cell.classList.contains('booked')) {
            if (cell.classList.contains('pending')) {
                // Restore pending booking styling
                cell.style.backgroundColor = '#ffebee';
                cell.style.color = ''; // Reset to default

                // Restore text colors
                const textElements = cell.querySelectorAll('span');
                textElements.forEach(el => {
                    if (el.classList.contains('pending') || el.textContent.includes('(Pending)')) {
                        el.style.color = '#990000'; // Red for pending text
                    } else {
                        el.style.color = '#000000'; // Black for main text
                    }

                    // Add "Booked by" prefix if not already present
                    if (el.classList.contains('booking-info') && !el.textContent.trim().startsWith('Booked by:')) {
                        // Extract the reason text (everything before " (Pending)")
                        const pendingIndex = el.textContent.indexOf(' (Pending)');
                        if (pendingIndex > -1) {
                            const reasonText = el.textContent.substring(0, pendingIndex).trim();
                            el.textContent = `Booked by: ${reasonText} (Pending)`;
                        }
                    }
                });
            } else {
                // Restore regular booking styling
                cell.style.backgroundColor = '#f3f4f6'; // Light gray background
                cell.style.color = ''; // Reset to default

                // Restore text colors
                const textElements = cell.querySelectorAll('span');
                textElements.forEach(el => {
                    el.style.color = '#4b5563'; // Dark gray for text

                    // Add "Booked by" prefix if not already present
                    if (el.classList.contains('booked-text') && !el.textContent.trim().startsWith('Booked by:')) {
                        el.textContent = `Booked by: ${el.textContent.trim()}`;
                    }
                });
            }

            // Log the restoration for debugging
            console.log('Restored styling for booked cell:', cell.dataset.room, cell.dataset.time);
        }
    }

    // Handle cell selection with multi-select
    if (bookingTable) {
        bookingTable.addEventListener('click', function(e) {
            const cell = e.target.closest('td.booking-cell');
            if (!cell || cell.classList.contains('time-slot')) return;

            // For non-admins, prevent selecting booked or pending slots
            if (!isAdmin && (cell.classList.contains('booked') || cell.classList.contains('pending'))) {
                console.log("Non-admin tried to select a booked slot");
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
                return;
            }

            // Toggle selection behavior - click once to select, click again to deselect
            if (cell.classList.contains('selected')) {
                // If already selected, deselect it
                console.log('Deselecting cell:', cell.dataset.room, cell.dataset.time,
                            'Booked:', cell.classList.contains('booked'),
                            'Pending:', cell.classList.contains('pending'));

                cell.classList.remove('selected');
                selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);

                // Restore original styling for booked cells
                restoreBookedCellStyling(cell);
            } else {
                // Add to selection
                console.log('Selecting cell:', cell.dataset.room, cell.dataset.time,
                            'Booked:', cell.classList.contains('booked'),
                            'Pending:', cell.classList.contains('pending'));

                cell.classList.add('selected');
                selectedCells.push(cell);
            }

            // If admin selects a booked cell, make sure the selection is visible
            if (isAdmin && (cell.classList.contains('booked') || cell.classList.contains('pending')) && cell.classList.contains('selected')) {
                // Make sure the selection is visible over the booked styling
                cell.style.backgroundColor = '#1e40af';
                cell.style.color = 'white';

                // Make any text inside the cell white
                const textElements = cell.querySelectorAll('span');
                textElements.forEach(el => {
                    el.style.color = 'white';
                });
            }
        });

        // Add keyboard shortcut to clear all selections (Escape key)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Clear all cell selections
                selectedCells.forEach(cell => {
                    cell.classList.remove('selected');
                    restoreBookedCellStyling(cell);
                });
                selectedCells = [];

                // Clear header selection from all headers
                const allHeaders = bookingTable.querySelectorAll('th.room-header, th.selectable-header');
                allHeaders.forEach(header => {
                    if (header.classList.contains('selected')) {
                        console.log('Clearing selection from header:', header.textContent);
                        header.classList.remove('selected');
                    }
                });
                selectedHeader = null;
            }
        });
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

    // Handle booking button click
    if (bookButton) {
        // Remove any existing click listeners by cloning and replacing the button
        const newBookButton = bookButton.cloneNode(true);
        bookButton.parentNode.replaceChild(newBookButton, bookButton);
        // Use the new button for event listeners
        const bookButtonRef = newBookButton;

        // Flag to prevent multiple submissions
        let isSubmitting = false;

        // Create a debounced version of the booking function
        const debouncedBookingHandler = debounce(function() {
            // Prevent multiple submissions
            if (isSubmitting) {
                console.log('Booking submission already in progress, ignoring duplicate click');
                return;
            }

            // Set the flag to prevent duplicate submissions
            isSubmitting = true;
            console.log('Starting booking submission, isSubmitting =', isSubmitting);

            if (selectedCells.length === 0) {
                // Use the custom dialog system
                window.CustomDialog.showModal({
                    title: 'No Selection',
                    message: 'Please select at least one time slot',
                    type: 'WARNING',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'primary',
                            callback: modal => window.CustomDialog.closeModal(modal)
                        }
                    ]
                });

                // Reset the submission flag
                isSubmitting = false;
                return;
            }

            const reason = reasonInput.value.trim();
            if (!reason) {
                // Use the custom dialog system
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

                // Reset the submission flag
                isSubmitting = false;
                return;
            }

            // Get the booking URL from the container's data attribute or use the current URL
            const bookingContainer = document.getElementById('bookingContainer');
            let bookingUrl = bookingContainer ? bookingContainer.dataset.bookingUrl : window.location.href;

            // Get the date directly from the data-date attribute
            const dateElement = document.querySelector('.date-display');
            let date = dateElement.dataset.date;

            // Fallback to current date if attribute is missing
            if (!date) {
                console.warn("Date attribute missing, using current date");
                const today = new Date();
                date = today.toISOString().split('T')[0];
            }

            const floorSlug = selectedCells[0].dataset.floor;

            // IMPORTANT: Store selected cells for processing BEFORE showing the popup
            // This ensures we have the cells to process
            const cellsToProcess = [...selectedCells]; // Create a copy before clearing
            console.log("Selected cells to process:", cellsToProcess.length);

            if (cellsToProcess.length === 0) {
                console.error("No cells selected for booking!");
                window.CustomDialog.showModal({
                    title: 'No Selection',
                    message: 'Please select at least one time slot',
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

            // Create a more concise message for multiple bookings
            let confirmationMessage = '';

            // Count the actual number of valid slots being processed
            // Filter out any invalid cells or duplicates
            const validCells = cellsToProcess.filter(cell =>
                cell && cell.dataset && cell.dataset.room && cell.dataset.time
            );

            // Create a unique identifier for each cell to detect duplicates
            const uniqueCellIds = new Set();
            const uniqueCells = validCells.filter(cell => {
                const cellId = `${cell.dataset.room}_${cell.dataset.time}_${cell.dataset.floor || ''}`;
                if (uniqueCellIds.has(cellId)) {
                    return false; // Skip duplicates
                }
                uniqueCellIds.add(cellId);
                return true;
            });

            // Log the actual count for debugging
            console.log(`Original cells: ${cellsToProcess.length}, Valid unique cells: ${uniqueCells.length}`);

            // Create the prefixed reason for consistency
            const prefixedReason = `Booked by: ${reason}`;

            if (uniqueCells.length === 0) {
                confirmationMessage = "No slots selected"; // Fallback, should never happen
            } else if (uniqueCells.length === 1) {
                // For a single booking, show the full details
                const cell = uniqueCells[0];
                const room = cell.dataset.room;
                const time = cell.dataset.time;
                confirmationMessage = `Booking request submitted for ${time} in ${room} with reason "${prefixedReason}"`;
            } else {
                // For multiple bookings, show a summary
                // Get unique rooms
                const uniqueRooms = [...new Set(uniqueCells.map(cell => cell.dataset.room))];

                // We could get the date from the page if needed in the future
                // const dateElement = document.querySelector('.date-display');

                if (uniqueRooms.length === 1) {
                    // All bookings in the same room
                    confirmationMessage = `Successfully submitted ${uniqueCells.length} booking requests in ${uniqueRooms[0]} with reason "${prefixedReason}"`;
                } else {
                    // Bookings across multiple rooms
                    confirmationMessage = `Successfully submitted ${uniqueCells.length} booking requests across ${uniqueRooms.length} rooms with reason "${prefixedReason}"`;
                }
            }

            // Show success message with the concise information
            window.CustomDialog.showModal({
                title: 'Request Submitted',
                message: confirmationMessage,
                type: 'REQUEST',
                buttons: [
                    {
                        text: 'OK',
                        type: 'primary',
                        callback: modal => window.CustomDialog.closeModal(modal)
                    }
                ]
            });

            // Debug the selected cells
            cellsToProcess.forEach((cell, index) => {
                console.log(`Cell ${index}:`, {
                    room: cell.dataset.room,
                    time: cell.dataset.time,
                    floor: cell.dataset.floor
                });
            });

            // Mark selected cells as pending with grey background
            cellsToProcess.forEach(cell => {
                cell.classList.add('pending');
                cell.classList.add('booked'); // Add booked class to prevent selection and apply grey background
                cell.classList.remove('selected');
                // Use black text with red "Pending" status
                cell.innerHTML = `<span class="booking-info pending" style="color: #000000;">Booked by: ${reason} <span style="color: #990000;">(Pending)</span></span>`;

                // Set red background color for pending bookings
                cell.style.backgroundColor = '#ffebee';
            });

            // Clear selections and reason
            reasonInput.value = '';

            // Clear the global selectedCells array
            selectedCells = [];

            // Also clear any localStorage selection state
            try {
                // Get the floor slug from the page
                const floorSlugMeta = document.querySelector('meta[name="floor-slug"]');
                const floorSlug = floorSlugMeta ? floorSlugMeta.content :
                                (window.location.pathname.includes('/restricted-booking/') ?
                                window.location.pathname.split('/restricted-booking/')[1].split('/')[0] : '');

                if (floorSlug) {
                    // Get the current date from the URL or use today's date
                    const urlParams = new URLSearchParams(window.location.search);
                    const currentDate = urlParams.get('date') || new Date().toISOString().split('T')[0];

                    // Create the storage key
                    const storageKey = `bookingSelections_${floorSlug}_${currentDate}`;

                    // Remove the saved selections
                    localStorage.removeItem(storageKey);
                    console.log(`Cleared saved selections from localStorage for key: ${storageKey}`);
                }
            } catch (error) {
                console.error('Error clearing selection state:', error);
            }

            // Log the cells to process again to make sure they're still valid
            console.log("Cells to process after clearing:", cellsToProcess.length);

            // Process bookings in the background
            let successCount = 0;
            let errorMessages = [];

            // Process bookings in the background without waiting
            (async function() {
                try {
                    console.log("Processing bookings for cells:", cellsToProcess.length);

                    if (cellsToProcess.length === 0) {
                        console.error("No cells to process! This is likely the issue.");
                        return;
                    }

                    // Log all the data we're about to send
                    console.log("Booking URL:", bookingUrl);
                    console.log("Floor slug:", floorSlug);
                    console.log("Date:", date);
                    console.log("Original Reason:", reason);
                    console.log("Prefixed Reason:", prefixedReason);
                    console.log("CSRF Token:", getCookie('csrftoken'));

                    // Double-check that we have cells to process
                    if (cellsToProcess.length === 0) {
                        console.error("No cells to process in the async function! This shouldn't happen.");
                        return;
                    }

                    console.log("Starting to process bookings for cells:", cellsToProcess.length);

                    // Add "Booked by" prefix to the reason
                    const prefixedReason = `Booked by: ${reason}`;

                    // Prepare batch booking data - collect all cells into a single request
                    const batchBookingData = {
                        floor: floorSlug,
                        date: date,
                        reason: prefixedReason,
                        bookings: [] // Array to hold all booking slots
                    };

                    // Use the uniqueCells array we created earlier to avoid duplicates
                    // If it doesn't exist, create it now
                    const validCells = cellsToProcess.filter(cell =>
                        cell && cell.dataset && cell.dataset.room && cell.dataset.time
                    );

                    // Create a unique identifier for each cell to detect duplicates
                    const uniqueCellIds = new Set();
                    const uniqueCells = validCells.filter(cell => {
                        const cellId = `${cell.dataset.room}_${cell.dataset.time}_${cell.dataset.floor || ''}`;
                        if (uniqueCellIds.has(cellId)) {
                            return false; // Skip duplicates
                        }
                        uniqueCellIds.add(cellId);
                        return true;
                    });

                    console.log(`Preparing batch with ${uniqueCells.length} unique cells out of ${cellsToProcess.length} total cells`);

                    // Add each unique cell's data to the batch request
                    for (let i = 0; i < uniqueCells.length; i++) {
                        const cell = uniqueCells[i];
                        const room = cell.dataset.room;
                        const timeSlot = cell.dataset.time;

                        // Add this booking to the batch
                        batchBookingData.bookings.push({
                            room: room,
                            time_slot: timeSlot
                        });

                        console.log(`Added booking ${i+1}/${uniqueCells.length} for ${room} at ${timeSlot} to batch`);
                    }

                    console.log("Batch booking data:", JSON.stringify(batchBookingData));

                    // Check if we have any valid bookings to process
                    if (batchBookingData.bookings.length === 0) {
                        console.error("No valid bookings to process after validation");
                        return;
                    }

                    // Send batch booking request with retry logic
                    let retries = 3;
                    let success = false;

                    while (retries > 0 && !success) {
                        try {
                            console.log(`Batch booking attempt ${4-retries}`);

                            // Send batch booking request to a new endpoint
                            // Extract the floor slug from the URL
                            const urlParts = bookingUrl.split('/');
                            const floorSlugIndex = urlParts.indexOf('restricted-booking') + 1;
                            const floorSlugFromUrl = urlParts[floorSlugIndex];

                            // Construct the batch booking URL correctly
                            const batchBookingUrl = `/booking/restricted-booking/${floorSlugFromUrl}/batch/`;
                            console.log("Using batch booking URL:", batchBookingUrl);

                            // First try the batch endpoint
                            let response = await fetch(batchBookingUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': getCookie('csrftoken')
                                },
                                body: JSON.stringify(batchBookingData)
                            });

                            // If batch endpoint doesn't exist, fall back to individual bookings
                            if (response.status === 404) {
                                console.log("Batch endpoint not found, falling back to individual bookings");

                                // Process one booking at a time as before
                                // First, create a batch ID to group these bookings together
                                const batchId = Date.now().toString(); // Use timestamp as batch ID
                                console.log(`Created batch ID: ${batchId} for ${cellsToProcess.length} bookings`);

                                // Process one booking at a time as before, but use uniqueCells
                                // to avoid duplicates
                                for (let i = 0; i < uniqueCells.length; i++) {
                                    const cell = uniqueCells[i];
                                    const room = cell.dataset.room;
                                    const timeSlot = cell.dataset.time;

                                    const requestBody = {
                                        room: room,
                                        time_slot: timeSlot,
                                        floor: floorSlug,
                                        date: date,
                                        reason: prefixedReason, // Use the prefixed reason
                                        is_batch: true, // Flag to indicate this is part of a batch
                                        batch_size: batchBookingData.bookings.length, // Total number of bookings in this batch
                                        batch_index: i, // Position in the batch (for email control)
                                        batch_id: batchId // Unique ID to group these bookings together
                                    };

                                    console.log(`Sending individual booking ${i+1}/${cellsToProcess.length}:`, requestBody);

                                    response = await fetch(bookingUrl, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRFToken': getCookie('csrftoken')
                                        },
                                        body: JSON.stringify(requestBody)
                                    });

                                    if (response.ok) {
                                        const data = await response.json();
                                        if (data.success || data.status === 'success') {
                                            successCount++;
                                        }
                                    }
                                }

                                // If we processed at least one booking successfully, consider it a success
                                if (successCount > 0) {
                                    success = true;
                                } else {
                                    retries--;
                                }
                            } else {
                                // Process the batch response
                                console.log(`Batch response status:`, response.status);

                                if (response.ok) {
                                    const data = await response.json();
                                    console.log(`Batch response data:`, data);

                                    if (data.success || data.status === 'success') {
                                        // Handle success
                                        successCount = data.success_count || batchBookingData.bookings.length;
                                        console.log(`Batch booking successful for ${successCount} slots`);
                                        success = true;
                                    } else {
                                        // Handle error from server
                                        console.error(`Error in batch booking: ${data.error || data.message || 'Unknown error'}`);
                                        retries--;
                                    }
                                } else {
                                    console.error(`HTTP error ${response.status} for batch booking`);
                                    retries--;
                                }
                            }
                        } catch (fetchError) {
                            console.error(`Network error for batch booking:`, fetchError);
                            retries--;
                        }

                        // Wait a bit before retrying
                        if (!success && retries > 0) {
                            console.log(`Waiting before retry for batch booking...`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if (!success) {
                        console.error(`Failed to process batch booking after multiple attempts`);
                    }
                } catch (error) {
                    console.error("Error in background booking process:", error);
                } finally {
                    // Reset the submission flag after all processing is done
                    isSubmitting = false;
                    console.log('Booking submission completed, isSubmitting =', isSubmitting);
                }
            })();

            // Clear the form and selections
            reasonInput.value = '';
            selectedCells.forEach(cell => {
                if (!cell.classList.contains('pending')) {
                    cell.classList.remove('selected');
                }
            });
            selectedCells = [];

            // Function to show error popup
            function showErrorPopup() {
                // Create a custom styled alert similar to the success popup
                const alertDiv = document.createElement('div');
                alertDiv.style.position = 'fixed';
                alertDiv.style.top = '50%';
                alertDiv.style.left = '50%';
                alertDiv.style.transform = 'translate(-50%, -50%)';
                alertDiv.style.backgroundColor = '#fff';
                alertDiv.style.padding = '30px';
                alertDiv.style.borderRadius = '5px';
                alertDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                alertDiv.style.zIndex = '9999';
                alertDiv.style.minWidth = '400px';
                alertDiv.style.maxWidth = '500px';
                alertDiv.style.textAlign = 'center';

                // Add error title
                const titleP = document.createElement('h2');
                titleP.textContent = 'Error';
                titleP.style.color = '#F44336';
                titleP.style.marginBottom = '15px';
                titleP.style.fontSize = '28px';
                titleP.style.fontWeight = 'bold';

                // Add error messages
                const messagesDiv = document.createElement('div');
                messagesDiv.style.textAlign = 'left';
                messagesDiv.style.marginBottom = '25px';
                messagesDiv.style.maxHeight = '200px';
                messagesDiv.style.overflowY = 'auto';
                messagesDiv.style.color = '#555';

                errorMessages.forEach(msg => {
                    const msgP = document.createElement('p');
                    msgP.textContent = msg;
                    msgP.style.margin = '5px 0';
                    messagesDiv.appendChild(msgP);
                });

                // Add Close button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.padding = '10px 30px';
                closeButton.style.backgroundColor = '#F44336';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '4px';
                closeButton.style.cursor = 'pointer';
                closeButton.style.fontSize = '16px';
                closeButton.style.fontWeight = 'normal';

                // Add event listener to close the alert
                closeButton.addEventListener('click', function() {
                    document.body.removeChild(alertDiv);
                    document.body.removeChild(overlay);
                });

                // Add elements to the alert
                alertDiv.appendChild(titleP);
                alertDiv.appendChild(messagesDiv);
                alertDiv.appendChild(closeButton);

                // Create a dark overlay
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '9998';

                // Add the alert and overlay to the body
                document.body.appendChild(overlay);
                document.body.appendChild(alertDiv);
            }

            // Show error popup if there were any errors
            if (errorMessages.length > 0) {
                showErrorPopup();
            }
        }, 300); // 300ms debounce time

        // Attach the debounced handler to the button
        bookButtonRef.addEventListener('click', debouncedBookingHandler);
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

    // Set up real-time updates using localStorage events and API polling
    function setupRealTimeUpdates() {
        // Store the last update timestamp
        let lastUpdateTimestamp = Date.now() / 1000; // Convert to seconds

        // Store the last deletion timestamp (used in the storage event listener)
        const lastDeletionTimestamp = localStorage.getItem('lastDeletionTimestamp') || '0';
        console.log(`Current deletion timestamp: ${lastDeletionTimestamp}`);

        // Function to clear any selection state for the current page
        function clearSelectionState() {
            try {
                // Get the floor slug from the page
                const floorSlugMeta = document.querySelector('meta[name="floor-slug"]');
                const floorSlug = floorSlugMeta ? floorSlugMeta.content :
                                 (window.location.pathname.includes('/restricted-booking/') ?
                                  window.location.pathname.split('/restricted-booking/')[1].split('/')[0] : '');

                if (!floorSlug) {
                    console.log('Could not determine floor slug for clearing selection state');
                    return;
                }

                // Get the current date from the URL or use today's date
                const urlParams = new URLSearchParams(window.location.search);
                const currentDate = urlParams.get('date') || new Date().toISOString().split('T')[0];

                // Create the storage key
                const storageKey = `bookingSelections_${floorSlug}_${currentDate}`;

                // Remove the saved selections
                localStorage.removeItem(storageKey);
                console.log(`Cleared saved selections from localStorage for key: ${storageKey}`);

                // Also clear any selected cells in the UI
                const selectedCells = document.querySelectorAll('.booking-cell.selected');
                selectedCells.forEach(cell => {
                    cell.classList.remove('selected');
                    // Restore original styling if needed
                    if (typeof restoreBookedCellStyling === 'function' && cell.classList.contains('booked')) {
                        restoreBookedCellStyling(cell);
                    }
                });

                // Reset the global selectedCells array
                window.selectedCells = [];
            } catch (error) {
                console.error('Error clearing selection state:', error);
            }
        }

        // Listen for booking approval events from other tabs/windows
        window.addEventListener('storage', function(event) {
            if (event.key === 'bookingApproved' || event.key === 'bookingRejected') {
                console.log(`Booking ${event.key === 'bookingApproved' ? 'approved' : 'rejected'} event detected`);

                // Clear any selection state before reloading
                clearSelectionState();

                // Reload the page to reflect the changes
                window.location.reload();
            }

            // Listen for deletion events
            if (event.key === 'lastDeletionTimestamp') {
                console.log('Booking deletion event detected');

                // Clear any selection state before reloading
                clearSelectionState();

                // Reload the page to reflect the changes
                window.location.reload();
            }
        });

        // Check for approval/rejection events every 5 seconds
        setInterval(function() {
            // Make an AJAX request to check for updates using our API endpoint
            fetch(`/booking/check-updates/?last_update=${lastUpdateTimestamp}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Checking for booking updates:', data);

                    if (data.has_updates) {
                        console.log('Updates detected! Refreshing page...');
                        // Update the timestamp
                        lastUpdateTimestamp = data.last_update;
                        // Reload the page to get the latest booking status
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('Error checking for booking updates:', error);
                });
        }, 5000); // Check every 5 seconds
    }

    // Initialize real-time updates
    setupRealTimeUpdates();

    // Add "Booked by" prefix to all existing booked cells on page load
    function addPrefixToExistingBookings() {
        // For regular booked cells
        document.querySelectorAll('.booking-cell .booked-text').forEach(el => {
            if (!el.textContent.trim().startsWith('Booked by:')) {
                el.textContent = `Booked by: ${el.textContent.trim()}`;
            }
        });

        // For pending cells
        document.querySelectorAll('.booking-cell .booking-info.pending').forEach(el => {
            if (!el.textContent.trim().startsWith('Booked by:')) {
                const pendingIndex = el.textContent.indexOf(' (Pending)');
                if (pendingIndex > -1) {
                    const reasonText = el.textContent.substring(0, pendingIndex).trim();
                    el.textContent = `Booked by: ${reasonText} (Pending)`;
                }
            }
        });
    }

    // Run the function after a short delay to ensure all elements are loaded
    setTimeout(addPrefixToExistingBookings, 500);
});