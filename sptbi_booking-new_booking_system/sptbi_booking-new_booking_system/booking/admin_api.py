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
        
        # Add new room
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
        
        # Check if room exists
        if room_name not in rooms:
            return JsonResponse({'status': 'error', 'message': 'Room not found'})
        
        # Remove room
        rooms.remove(room_name)
        
        # Update floor
        floor.rooms = rooms
        floor.save()
        
        # Delete all bookings for this room
        Booking.objects.filter(floor=floor, room=room_name).delete()
        
        return JsonResponse({'status': 'success', 'message': 'Column deleted successfully'})
    
    except Exception as e:
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
