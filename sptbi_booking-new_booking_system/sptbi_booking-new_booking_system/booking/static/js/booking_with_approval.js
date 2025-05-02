document.addEventListener("DOMContentLoaded", function() {
    // Select all booking cells
    const bookingCells = document.querySelectorAll('.booking-cell');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Function to handle booking
    bookingCells.forEach(cell => {
        cell.addEventListener('click', function() {
            if (cell.dataset.booked === 'false' && cell.dataset.isAuthenticated === 'true') {
                const room = cell.dataset.room;
                const timeSlot = cell.dataset.time;
                const floorSlug = cell.dataset.floor;
                const floorType = cell.dataset.bookingType || 'unrestricted';

                // Show confirmation modal with appropriate message
                const confirmMessage = floorType === 'restricted' ?
                    `This booking requires approval. Do you want to request to book room ${room} at ${timeSlot}?` :
                    `Are you sure you want to book room ${room} at ${timeSlot}?`;

                const confirmBooking = confirm(confirmMessage);

                if (confirmBooking) {
                    // Prompt for booking reason
                    const bookingReason = prompt('Please enter the reason for booking:');
                    if (!bookingReason) return; // Cancel if no reason provided

                    // Make AJAX request to submit the booking
                    const bookingData = {
                        'room': room,
                        'time_slot': timeSlot,
                        'floor': floorSlug,
                        'reason': bookingReason,
                        'csrfmiddlewaretoken': csrfToken
                    };
                    const endpoint = floorType === 'Requires Approval' ? '/booking/restricted-booking/' : '/booking/book/';
                    fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify(bookingData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Update UI based on booking type
                            cell.classList.add('booked');
                            cell.dataset.booked = 'true';
                            
                            if (floorType === 'restricted') {
                                cell.classList.add('pending-approval');
                                alert("Your booking request has been sent for approval.");
                            } else {
                                cell.classList.add('confirmed');
                                alert("Your booking has been confirmed.");
                            }
                        } else {
                            alert(data.message || "There was an error while processing your booking request.");
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                        alert("An error occurred while submitting the booking.");
                    });
                }
            } else if (cell.dataset.isAuthenticated === 'false') {
                alert("You need to be logged in to make a booking.");
            } else {
                const status = cell.dataset.status;
                if (status === 'pending') {
                    alert("This booking is pending approval.");
                } else if (status === 'rejected') {
                    alert("This booking request was rejected.");
                } else {
                    alert("This slot is already booked.");
                }
            }
        });
    });

    // Add CSS styles for different booking states
    const style = document.createElement('style');
    style.textContent = `
        .booking-cell.pending-approval {
            background-color: #fef3c7 !important;
            color: #92400e !important;
        }
        .booking-cell.confirmed {
            background-color: #dcfce7 !important;
            color: #166534 !important;
        }
    `;
    document.head.appendChild(style);
});
