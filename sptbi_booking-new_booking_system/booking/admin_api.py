import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import get_object_or_404
from .models import Floor, Booking
from datetime import datetime
import re

# Helper function to check if user is admin
def is_admin(user):
    return user.is_staff

@login_required
@user_passes_test(is_admin)
@csrf_exempt
def add_column_api(request):
    """API endpoint to add a new column (room) to a floor"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'})

    try:
        data = json.loads(request.body)
        floor_slug = data.get('floor_slug')
        room_name = data.get('room_name')

        if not floor_slug or not room_name:
            return JsonResponse({'status': 'error', 'message': 'Missing required parameters'})

        # Get the floor
        floor = get_object_or_404(Floor, slug=floor_slug)

        # Get current rooms
        rooms = floor.rooms or []

        # Check if this is a Meeting Room 1 being added
        if room_name.startswith("Meeting Room 1"):
            # If Meeting Room 1 is being added, make sure it's at the beginning
            # First, remove any existing Meeting Room 1 entries
            rooms = [r for r in rooms if not r.startswith("Meeting Room 1")]
            # Then add the new Meeting Room 1 at the beginning
            rooms.insert(0, room_name)
        else:
            # For other rooms, just append to the end
            rooms.append(room_name)

        # Update floor
        floor.rooms = rooms
        floor.save()

        return JsonResponse({'status': 'success', 'message': 'Column added successfully'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

@login_required
@user_passes_test(is_admin)
@csrf_exempt
def delete_column_api(request):
    """API endpoint to delete a column (room) from a floor"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'})

    try:
        data = json.loads(request.body)
        floor_slug = data.get('floor_slug')
        room_name = data.get('room_name')

        if not floor_slug or not room_name:
            return JsonResponse({'status': 'error', 'message': 'Missing required parameters'})

        # Get the floor
        floor = get_object_or_404(Floor, slug=floor_slug)

        # Get current rooms
        rooms = floor.rooms or []

        # Debug information
        print(f"Attempting to delete room: '{room_name}'")
        print(f"Available rooms: {rooms}")

        # Try to find the room by exact match first
        room_found = False
        exact_match = None

        if room_name in rooms:
            exact_match = room_name
            room_found = True
        else:
            # Try to find a case-insensitive match
            for room in rooms:
                if room.lower() == room_name.lower():
                    exact_match = room
                    room_found = True
                    break

            # If still not found, try to match by pattern (e.g., "Meeting Room 1" vs "Meeting Room 1 - 4th floor")
            if not room_found:
                # Extract room number pattern (e.g., "Meeting Room 1")
                room_pattern_match = re.match(r'(Meeting Room \d+)', room_name)
                if room_pattern_match:
                    room_pattern = room_pattern_match.group(1)
                    print(f"Looking for pattern: '{room_pattern}'")

                    for room in rooms:
                        if room_pattern in room:
                            exact_match = room
                            room_found = True
                            print(f"Found matching room: '{room}'")
                            break

        if not room_found:
            return JsonResponse({
                'status': 'error',
                'message': f'Room not found. Available rooms: {", ".join(rooms)}'
            })

        # Remove room using the exact match from the database
        rooms.remove(exact_match)

        # Update floor
        floor.rooms = rooms
        floor.save()

        # Delete all bookings for this room
        Booking.objects.filter(floor=floor, room=exact_match).delete()

        return JsonResponse({
            'status': 'success',
            'message': f'Column "{exact_match}" deleted successfully'
        })

    except Exception as e:
        print(f"Error in delete_column_api: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)})

@login_required
@user_passes_test(is_admin)
@csrf_exempt
def delete_booking_api(request):
    """API endpoint to delete a booking"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'})

    try:
        data = json.loads(request.body)
        floor_slug = data.get('floor_slug')
        room = data.get('room')
        time_slot = data.get('time_slot')
        date_str = data.get('date')

        if not floor_slug or not room or not time_slot or not date_str:
            return JsonResponse({'status': 'error', 'message': 'Missing required parameters'})

        # Get the floor
        floor = get_object_or_404(Floor, slug=floor_slug)

        # Parse date
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid date format'})

        # Parse time
        time_match = re.match(r'(\d+)[:\.]\s*(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_slot.lower())
        if not time_match:
            # Try alternative format without colon/period (e.g., "10 am")
            time_match = re.match(r'(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_slot.lower())
            if time_match:
                hours = int(time_match.group(1))
                minutes = 0
                period = time_match.group(2).lower()
            else:
                return JsonResponse({'status': 'error', 'message': f'Invalid time format: {time_slot}'})
        else:
            hours = int(time_match.group(1))
            minutes = int(time_match.group(2))
            period = time_match.group(3).lower()

        # Normalize period to am/pm
        if period in ['a.m.', 'am']:
            period = 'am'
        elif period in ['p.m.', 'pm']:
            period = 'pm'

        # Convert to 24-hour format
        if period == 'pm' and hours < 12:
            hours += 12
        elif period == 'am' and hours == 12:
            hours = 0

        from datetime import time
        time_obj = time(hours, minutes)

        # Find and delete the booking
        booking = Booking.objects.filter(
            floor=floor,
            room=room,
            date=date,
            time_slot=time_obj
        ).first()

        if not booking:
            return JsonResponse({'status': 'error', 'message': 'Booking not found'})

        booking.delete()

        return JsonResponse({'status': 'success', 'message': 'Booking deleted successfully'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
