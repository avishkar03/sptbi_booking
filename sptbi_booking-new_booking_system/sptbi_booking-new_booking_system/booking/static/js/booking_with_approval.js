// Booking with approval script
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ booking_with_approval.js loaded");

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

    // Add CSS for pending status
    const style = document.createElement('style');
    style.textContent = `
        .booking-cell.pending {
            background-color: #ffcccc !important;
            color: #990000 !important;
            cursor: not-allowed !important;
        }
        .booking-info.pending {
            color: #990000 !important;
            font-weight: bold;
        }
        .booking-cell.selected {
            background-color: #1e40af !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);

    // Check if user is admin
    const bookingContainer = document.getElementById('bookingContainer');
    const isAdmin = bookingContainer ? bookingContainer.dataset.isAdmin === 'true' : false;
    console.log("User is admin:", isAdmin);

    // Cell selection tracking

    // Function to restore original styling for booked cells
    function restoreBookedCellStyling(cell) {
        if (cell.classList.contains('booked')) {
            if (cell.classList.contains('pending')) {
                cell.style.backgroundColor = '#ffebee';
                const textElements = cell.querySelectorAll('span');
                textElements.forEach(el => {
                    if (el.classList.contains('pending')) {
                        el.style.color = '#d32f2f';
                    } else {
                        el.style.color = '#4b5563';
                    }
                });
            } else {
                cell.style.backgroundColor = '#f3f4f6';
                const textElements = cell.querySelectorAll('span');
                textElements.forEach(el => {
                    el.style.color = '#4b5563';
                });
            }
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
                return;
            }

            // Toggle selection behavior - click once to select, click again to deselect
            if (cell.classList.contains('selected')) {
                // If already selected, deselect it
                cell.classList.remove('selected');
                selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);

                // Restore original styling for booked cells
                restoreBookedCellStyling(cell);
            } else {
                // Add to selection
                cell.classList.add('selected');
                selectedCells.push(cell);
            }

            // If admin selects a booked cell, make sure the selection is visible
            if (isAdmin && (cell.classList.contains('booked') || cell.classList.contains('pending'))) {
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
                // Clear all selections
                selectedCells.forEach(cell => {
                    cell.classList.remove('selected');
                    restoreBookedCellStyling(cell);
                });
                selectedCells = [];
            }
        });
    }

    // Handle booking button click
    if (bookButton) {
        bookButton.addEventListener('click', function() {
            if (selectedCells.length === 0) {
                // Create and show a styled error popup for no selection
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
                alertDiv.style.textAlign = 'center';

                const titleP = document.createElement('h2');
                titleP.textContent = 'Error';
                titleP.style.color = '#F44336';
                titleP.style.marginBottom = '15px';
                titleP.style.fontSize = '28px';
                titleP.style.fontWeight = 'bold';

                const messageP = document.createElement('p');
                messageP.textContent = 'Please select at least one time slot';
                messageP.style.marginBottom = '25px';
                messageP.style.fontSize = '16px';
                messageP.style.color = '#555';

                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.padding = '10px 30px';
                closeButton.style.backgroundColor = '#F44336';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '4px';
                closeButton.style.cursor = 'pointer';
                closeButton.style.fontSize = '16px';

                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '9998';

                closeButton.addEventListener('click', function() {
                    document.body.removeChild(alertDiv);
                    document.body.removeChild(overlay);
                });

                alertDiv.appendChild(titleP);
                alertDiv.appendChild(messageP);
                alertDiv.appendChild(closeButton);

                document.body.appendChild(overlay);
                document.body.appendChild(alertDiv);
                return;
            }

            const reason = reasonInput.value.trim();
            if (!reason) {
                // Create and show a styled error popup for no reason
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
                alertDiv.style.textAlign = 'center';

                const titleP = document.createElement('h2');
                titleP.textContent = 'Error';
                titleP.style.color = '#F44336';
                titleP.style.marginBottom = '15px';
                titleP.style.fontSize = '28px';
                titleP.style.fontWeight = 'bold';

                const messageP = document.createElement('p');
                messageP.textContent = 'Please enter a reason for booking';
                messageP.style.marginBottom = '25px';
                messageP.style.fontSize = '16px';
                messageP.style.color = '#555';

                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.padding = '10px 30px';
                closeButton.style.backgroundColor = '#F44336';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '4px';
                closeButton.style.cursor = 'pointer';
                closeButton.style.fontSize = '16px';

                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '9998';

                closeButton.addEventListener('click', function() {
                    document.body.removeChild(alertDiv);
                    document.body.removeChild(overlay);
                });

                alertDiv.appendChild(titleP);
                alertDiv.appendChild(messageP);
                alertDiv.appendChild(closeButton);

                document.body.appendChild(overlay);
                document.body.appendChild(alertDiv);
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
                alert("Please select at least one time slot");
                return;
            }

            // Show success popup after we've verified we have cells to process
            showSuccessPopup();

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
                // Use red styling for pending bookings
                cell.innerHTML = `<span class="booking-info pending">${reason} (Pending)</span>`;

                // Set red background color for pending bookings
                cell.style.backgroundColor = '#ffebee';
            });

            // Clear selections and reason
            reasonInput.value = '';
            selectedCells = [];

            // Log the cells to process again to make sure they're still valid
            console.log("Cells to process after clearing:", cellsToProcess.length);

            // Process bookings in the background
            let successCount = 0;
            let errorMessages = [];

            // Process bookings in the background without waiting
            (async function() {
                console.log("Processing bookings for cells:", cellsToProcess.length);

                if (cellsToProcess.length === 0) {
                    console.error("No cells to process! This is likely the issue.");
                    return;
                }

                // Log all the data we're about to send
                console.log("Booking URL:", bookingUrl);
                console.log("Floor slug:", floorSlug);
                console.log("Date:", date);
                console.log("Reason:", reason);
                console.log("CSRF Token:", getCookie('csrftoken'));

                // Double-check that we have cells to process
                if (cellsToProcess.length === 0) {
                    console.error("No cells to process in the async function! This shouldn't happen.");
                    return;
                }

                console.log("Starting to process bookings for cells:", cellsToProcess.length);

                // Process one booking at a time to ensure they all get processed
                for (let i = 0; i < cellsToProcess.length; i++) {
                    const cell = cellsToProcess[i];

                    // Verify the cell has the required data
                    if (!cell || !cell.dataset || !cell.dataset.room || !cell.dataset.time) {
                        console.error(`Invalid cell at index ${i}:`, cell);
                        continue;
                    }

                    const room = cell.dataset.room;
                    const timeSlot = cell.dataset.time;

                    console.log(`Sending booking request ${i+1}/${cellsToProcess.length} for ${room} at ${timeSlot}`);

                    // Log the exact request we're sending
                    const requestBody = {
                        room: room,
                        time_slot: timeSlot,
                        floor: floorSlug,
                        date: date,
                        reason: reason
                    };
                    console.log("Request body:", JSON.stringify(requestBody));

                    try {
                        // Send booking request with retry logic
                        let retries = 3;
                        let success = false;

                        while (retries > 0 && !success) {
                            try {
                                console.log(`Attempt ${4-retries} for ${room} at ${timeSlot}`);

                                // Send booking request
                                const response = await fetch(bookingUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRFToken': getCookie('csrftoken')
                                    },
                                    body: JSON.stringify(requestBody)
                                });

                                console.log(`Response status for ${room} at ${timeSlot}:`, response.status);

                                if (response.ok) {
                                    const data = await response.json();
                                    console.log(`Response data for ${room} at ${timeSlot}:`, data);

                                    if (data.success || data.status === 'success') {
                                        // Handle success
                                        successCount++;
                                        console.log(`Booking successful for ${room} at ${timeSlot}`);
                                        success = true;
                                    } else {
                                        // Handle error from server
                                        console.error(`Error booking ${room} at ${timeSlot}: ${data.error || data.message || 'Unknown error'}`);
                                        retries--;
                                    }
                                } else {
                                    console.error(`HTTP error ${response.status} for ${room} at ${timeSlot}`);
                                    retries--;
                                }
                            } catch (fetchError) {
                                console.error(`Network error for ${room} at ${timeSlot}:`, fetchError);
                                retries--;
                            }

                            // Wait a bit before retrying
                            if (!success && retries > 0) {
                                console.log(`Waiting before retry for ${room} at ${timeSlot}...`);
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                        }

                        if (!success) {
                            console.error(`Failed to book ${room} at ${timeSlot} after multiple attempts`);
                        }
                    } catch (error) {
                        console.error(`Fatal error for ${room} at ${timeSlot}:`, error);
                    }
                }
            })();

            // Create and show the success popup immediately
            function showSuccessPopup() {
                // Create a custom styled alert similar to the example
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

                // Add success title
                const titleP = document.createElement('h2');
                titleP.textContent = 'Success!';
                titleP.style.color = '#4CAF50';
                titleP.style.marginBottom = '15px';
                titleP.style.fontSize = '28px';
                titleP.style.fontWeight = 'bold';

                // Add success message
                const messageP = document.createElement('p');
                messageP.textContent = 'Booking Submitted For Approval';
                messageP.style.marginBottom = '25px';
                messageP.style.fontSize = '16px';
                messageP.style.color = '#555';

                // Add Close button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.padding = '10px 30px';
                closeButton.style.backgroundColor = '#4CAF50';
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
                alertDiv.appendChild(messageP);
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

                // Clear the form and selections
                reasonInput.value = '';
                selectedCells.forEach(cell => {
                    if (!cell.classList.contains('pending')) {
                        cell.classList.remove('selected');
                    }
                });
                selectedCells = [];
            }

            // Success popup is already shown immediately

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

    // Set up real-time updates using localStorage events and API polling
    function setupRealTimeUpdates() {
        // Store the last update timestamp
        let lastUpdateTimestamp = Date.now() / 1000; // Convert to seconds

        // Listen for booking approval events from other tabs/windows
        window.addEventListener('storage', function(event) {
            if (event.key === 'bookingApproved' || event.key === 'bookingRejected') {
                console.log(`Booking ${event.key === 'bookingApproved' ? 'approved' : 'rejected'} event detected`);

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
});