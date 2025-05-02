document.addEventListener('DOMContentLoaded', function() {
    const adminControls = document.getElementById('adminControls');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const addColumnBtn = document.getElementById('addColumnBtn');
    let selectedSlots = [];
    
    console.log('JavaScript initialized');
    
    // Add click handlers to all booking cells
    document.querySelectorAll('.booking-cell.booked').forEach(cell => {
        cell.addEventListener('click', function(e) {
            console.log('Cell clicked:', this);
            // console.log('Is authenticated:', this.dataset.isAuthenticated);
            // console.log('Is booked:', this.dataset.booked);

            const floor = this.dataset.floor;
            

            console.log('floor selected:', floor);
            if(!floor || typeof floor !== 'string'){
                console.log('Invalid floor format');
                return;
            }

            console.log("Is authenticated:", this.dataset.isAuthenticated);
            console.log("Is booked:", this.dataset.booked);
            
            // Only allow selection if user is authenticated and cell is booked
            if (this.dataset.isAuthenticated !== 'true' || this.dataset.booked !== 'true') {
                console.log('Cell not selectable - auth:', this.dataset.isAuthenticated, 'booked:', this.dataset.booked);
                return;
            }
            
            // Toggle selection
            this.classList.toggle('selected');
            const isSelected = this.classList.contains('selected');
            const room = this.dataset.room;
            const time = this.dataset.time;
            const date = document.querySelector('.current-date').dataset.date;
            const floor = this.dataset.floor;
            
            console.log('Selection data:', { room, time, date, floor, isSelected });
            
            const slotData = {
                room: room,
                time_slot: time,
                date: date,
                floor: floor
            };

            if (isSelected) {
                selectedSlots.push(slotData);
            } else {
                selectedSlots = selectedSlots.filter(slot => 
                    !(slot.room === slotData.room && 
                      slot.time_slot === slotData.time_slot &&
                      slot.date === slotData.date)
                );
            }
            
            console.log('Selected slots:', selectedSlots);
            
            // Toggle admin controls
            adminControls.classList.toggle('show', selectedSlots.length > 0);
        });
    });
    
    // Handle delete button click
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', async () => {
            if (!selectedSlots.length) return;

            const confirmed = confirm(`Delete ${selectedSlots.length} selected slots?`);
            if (!confirmed) return;

            try {
                const csrfToken = getCookie('csrftoken');
                
                const response = await fetch('/booking/delete_slots/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(selectedSlots)
                });

                const result = await response.json();
                if (result.status === 'success') {
                    window.location.reload();
                } else {
                    alert('Deletion failed: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Deletion failed - check console for details');
            }
        });
    }

    // Date navigation
    const prevDayBtn = document.querySelector('.prev-day');
    const nextDayBtn = document.querySelector('.next-day');
    
    if (prevDayBtn && nextDayBtn) {
        prevDayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currentUrl = new URL(window.location.href);
            const date = currentUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
            const prevDate = new Date(date);
            prevDate.setDate(prevDate.getDate() - 1);
            currentUrl.searchParams.set('date', prevDate.toISOString().split('T')[0]);
            window.location.href = currentUrl.toString();
        });
        
        nextDayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currentUrl = new URL(window.location.href);
            const date = currentUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            currentUrl.searchParams.set('date', nextDate.toISOString().split('T')[0]);
            window.location.href = currentUrl.toString();
        });
    }

    // Log data before parsing
    const bookedSlotsData = document.querySelector('.booking-slots-data').textContent;
    console.log('Raw booked slots data:', bookedSlotsData);
    try {
        const bookedSlots = JSON.parse(bookedSlotsData);
        console.log('Parsed booked slots:', bookedSlots);
    } catch (error) {
        console.error('Error parsing booking data:', error);
    }

    // Ensure correct authentication data
    document.querySelectorAll('.booking-cell').forEach(cell => {
        console.log('Cell auth:', cell.dataset.isAuthenticated);
    });
    
    // Add Columns functionality
    if (addColumnBtn) {
        addColumnBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add Column button clicked');
            
            // Prompt for new room name
            const roomName = prompt('Enter new room name:');
            if (!roomName || roomName.trim() === '') return;
            
            // Add new column to the table
            const table = document.querySelector('.booking-table');
            const rows = table.querySelectorAll('tbody tr');
            
            // Add header
            const headerRow = table.querySelector('thead tr');
            const newHeader = document.createElement('th');
            newHeader.className = 'text-center room-header selectable-header';
            newHeader.textContent = roomName;
            headerRow.appendChild(newHeader);
            
            // Add cells for each row
            rows.forEach(row => {
                const newCell = document.createElement('td');
                newCell.className = 'booking-cell';
                row.appendChild(newCell);
            });
            
            console.log('New column added:', roomName);
        });
    }
});

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