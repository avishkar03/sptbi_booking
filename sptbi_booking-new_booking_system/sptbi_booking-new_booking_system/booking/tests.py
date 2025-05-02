from django.test import TestCase

# Create your tests here.
from booking.models import Booking, Floor
from django.contrib.auth.models import User

class BookingTestCase(TestCase):

    def setUp(self):
        # Set up a test floor for restricted bookings
        self.floor = Floor.objects.create(
            name="Test Floor",
            booking_type='restricted',  # This makes it a restricted booking type
            is_active=True
        )
        self.user = User.objects.create_user(username="testuser", password="password")

    def test_create_booking_pending_status(self):
        # Create a restricted booking
        booking = Booking.objects.create(
            floor=self.floor,
            time_slot="10:00 AM",
            room="Room 1",
            date="2025-04-24",
            booked_by="Test User",
            reason="Test Reason",
            user=self.user,
        )

        # Check if the status is 'pending'
        self.assertEqual(booking.status, 'pending')