import json
from datetime import datetime, timedelta, time
from django.core.mail import send_mail
from django.urls import reverse
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, JsonResponse
from .models import Booking, Floor
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

@login_required
@csrf_exempt  # Remove in production and use proper CSRF
def restricted_booking_view(request, floor_slug):
    floor = get_object_or_404(Floor, slug=floor_slug, is_active=True)
    available_floors = Floor.objects.filter(is_active=True).order_by('order')
    
    # Date handling (same as original)
    date_str = request.GET.get('date', datetime.now().strftime('%Y-%m-%d'))
    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        selected_date = datetime.now().date()

    # Time slots generation (same as original)
    start_time = datetime.strptime('09:00', '%H:%M')
    end_time = datetime.strptime('20:30', '%H:%M')
    time_slots = []
    current = start_time
    while current <= end_time:
        time_slots.append(current.time())
        current += timedelta(minutes=30)

    # Room structure (same as original - using floor.rooms JSONField)
    rooms = floor.rooms or [f"Meeting Room 1 - {floor.name}"]
    
    # Get bookings (same as original)
    bookings = Booking.objects.filter(floor=floor, date=selected_date)
    
    # Booked slots structure (same as original)
    booked_slots = {}
    for room in rooms:
        booked_slots[room] = {}
        for booking in bookings.filter(room=room):
            time_key = booking.time_slot.strftime('%I:%M %p').lower()
            if time_key.startswith('0'):
                time_key = time_key[1:]
            booked_slots[room][time_key] = {
                'booked_by': booking.user.username if booking.user else booking.booked_by,
                'reason': booking.reason,
                'status': booking.status,
            }

    # POST handling - modified for token approval
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            room = data.get('room')
            time_str = data.get('time_slot')
            reason = data.get('reason', '')
            
            # Time parsing (same as original)
            time_match = re.match(r'(\d+)[:\.]?(\d*)\s*(am|pm)', time_str.lower())
            if time_match:
                hours = int(time_match.group(1))
                minutes = int(time_match.group(2) or 0)
                period = time_match.group(3).lower()
                if period == 'pm' and hours < 12:
                    hours += 12
                elif period == 'am' and hours == 12:
                    hours = 0
                time_obj = time(hours, minutes)
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid time format'})

            # Check for conflicts (same as original)
            if Booking.objects.filter(
                floor=floor,
                room=room,
                date=selected_date,
                time_slot=time_obj
            ).exists():
                return JsonResponse({'status': 'error', 'message': 'Slot already booked'})

            # Create booking with token (NEW PART)
            booking = Booking.objects.create(
                floor=floor,
                room=room,
                time_slot=time_obj,
                date=selected_date,
                reason=reason,
                user=request.user,
                booked_by=request.user.company_name,
                status='pending',  # Changed to pending for approval
            )

            # Generate approval links (NEW)
            approve_url = request.build_absolute_uri(
                reverse('approve_booking', args=[booking.approval_token])
            )
            reject_url = request.build_absolute_uri(
                reverse('reject_booking', args=[booking.approval_token])
            )

            # Send email (NEW)
            send_mail(
                subject=f'Booking Approval Required: {room} at {time_str}',
                message=f"""A new booking requires your approval:
                
User: {request.user.company_name}
Room: {room}
Date: {selected_date}
Time: {time_str}
Reason: {reason}

Approve: {approve_url}
Reject: {reject_url}
""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.BOOKING_ADMIN_EMAIL],
            )

            return JsonResponse({'status': 'success'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    # Render same template as original with same context
    return render(request, 'booking/booking.html', {
        'floor': floor,
        'available_floors': available_floors,
        'selected_date': selected_date,
        'time_slots': time_slots,
        'rooms': rooms,
        'booked_slots': booked_slots,
        'prev_day': (selected_date - timedelta(days=1)).strftime('%Y-%m-%d'),
        'next_day': (selected_date + timedelta(days=1)).strftime('%Y-%m-%d'),
        'user_authenticated': request.user.is_authenticated,
    })

# Approval views (keep these the same as your new version)
def approve_booking(request, token):
    booking = get_object_or_404(Booking, approval_token=token, status='pending')
    booking.status = 'approved'
    booking.save()
    return HttpResponse('Booking approved')

def reject_booking(request, token):
    booking = get_object_or_404(Booking, approval_token=token, status='pending')
    booking.status = 'rejected'
    booking.save()
    return HttpResponse('Booking rejected')