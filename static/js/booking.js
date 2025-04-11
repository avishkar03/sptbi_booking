document.addEventListener('DOMContentLoaded', function() {
    const addColumnBtn = document.getElementById('addColumnBtn');
    const deleteColumnBtn = document.getElementById('deleteColumnBtn');
    const bookingTable = document.querySelector('.booking-table');
    const floorSlug = document.querySelector('meta[name="floor-slug"]')?.content;
    const currentFloor = document.querySelector('meta[name="floor-name"]')?.content;
    const bookingInterface = document.querySelector('.booking-interface');
    const bookingReason = document.getElementById('bookingReason');
    const bookButton = document.getElementById('bookButton');
    let selectedCell = null;

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
        // Remove existing event listeners first
        document.querySelectorAll('.booking-cell, .room-header').forEach(element => {
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        });

        // Add click handler for regular cells
        document.querySelectorAll('.booking-cell:not(.booked)').forEach(cell => {
            cell.addEventListener('click', function(e) {
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
        });

        // Add click handler for header cells
        document.querySelectorAll('th.room-header').forEach(header => {
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
        });

        // Make sure booked cells are not clickable
        document.querySelectorAll('.booking-cell.booked').forEach(cell => {
            cell.style.cursor = 'not-allowed';
            cell.style.backgroundColor = '#f3f4f6';
        });
    }

    // Initialize column deletion functionality
    if (deleteColumnBtn) {
        deleteColumnBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const selectedHeaders = document.querySelectorAll('th.room-header.selected');
            if (selectedHeaders.length === 0) {
                alert('Please select at least one column header to delete.');
                return;
            }

            if (!confirm('Are you sure you want to delete the selected columns?')) {
                return;
            }

            // Get indices of selected headers (excluding time slot column)
            const columnIndices = Array.from(selectedHeaders).map(header => 
                Array.from(header.parentNode.children).indexOf(header)
            );

            // Delete the columns and update the server
            deleteColumns(columnIndices);
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
                alert('Failed to delete columns: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete columns. Please try again.');
        }
    }

    // Initialize booking functionality
    if (bookButton) {
        bookButton.addEventListener('click', async function() {
            const selectedCells = document.querySelectorAll('.booking-cell.selected');
            if (selectedCells.length === 0) {
                alert('Please select at least one slot');
                return;
            }

            const reason = bookingReason.value.trim();
            if (!reason) {
                alert('Please enter a reason for booking');
                return;
            }

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
                        cell.innerHTML = `<span class="booked-text">${reason}</span>`;
                    });

                    // Reset the input
                    bookingReason.value = '';
                } else if (data.status === 'login_required') {
                    window.location.href = '/login/?next=' + window.location.pathname;
                } else {
                    alert(data.message || 'Failed to book the slots. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to book the slots. Please try again.');
            }
        });
    }

    // Rest of the existing code...
    // [Previous addNewColumn, createNewColumn, getSuffix, saveColumnStructure functions remain unchanged]

    // Initialize the cell selection functionality
    initializeCellSelection();

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

    // Add event listener for the 'Delete Slot' button
    const deleteSlotBtn = document.getElementById('deleteSlotBtn');
    if (deleteSlotBtn) {
        deleteSlotBtn.addEventListener('click', async function(event) {
            event.preventDefault(); // Prevent default link behavior

            const selectedCells = document.querySelectorAll('.booking-cell.selected');
            if (selectedCells.length === 0) {
                alert('Please select at least one slot to delete');
                return;
            }

            const slotsToDelete = Array.from(selectedCells).map(cell => {
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
                    date: selectedDate  // Include the date
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
                    // Remove the selected cells from the UI
                    selectedCells.forEach(cell => {
                        cell.classList.remove('selected');
                        cell.classList.remove('booked');
                        cell.style.backgroundColor = '';
                        cell.style.color = '';
                        cell.style.cursor = 'pointer';
                        cell.innerHTML = '';
                    });
                } else {
                    alert(data.message || 'Failed to delete the slots. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete the slots. Please try again.');
            }
        });
    }

    // Log the booking data being rendered
    // Use bookedSlots from the global scope if available, otherwise log a message
    try {
        console.log('Rendering booking data:', typeof bookedSlots !== 'undefined' ? bookedSlots : 'Booking data not available');
    } catch(e) {
        console.log('Booking data not defined in this scope');
    }
}); 