import re
import uuid
from django.conf import settings
import json
from datetime import datetime, timedelta, time
from django.core.mail import send_mail
from django.urls import reverse
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, JsonResponse
from .models import Booking, Floor
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


@login_required
@csrf_exempt  # Remove in production and use proper CSRF
# def restricted_booking_view(request, floor_slug):

#     #    ===== ENHANCED DEBUG LINES =====
#     print("\n===== NEW REQUEST =====")
#     print(f"Method: {request.method}")
#     print(f"Path: {request.path}")
#     print(f"User: {request.user} (Auth: {request.user.is_authenticated})")

#     if request.method == 'POST':
#         try:
#             print("\n--- RAW REQUEST BODY ---")
#             print(request.body.decode('utf-8'))  # Raw JSON payload

#             data = json.loads(request.body)
#             print("\n--- PARSED DATA ---")
#             print(f"Room: {data.get('room')}")
#             print(f"Time: {data.get('time_slot')}")
#             print(f"Reason: {data.get('reason')}")

#         except Exception as e:
#             print(f"\n!!! JSON PARSE ERROR: {str(e)} !!!")



#     floor = get_object_or_404(Floor, slug=floor_slug, is_active=True)
#     available_floors = Floor.objects.filter(is_active=True).order_by('order')

#     # Date handling (same as original)
#     date_str = request.GET.get('date', datetime.now().strftime('%Y-%m-%d'))
#     try:
#         selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
#     except ValueError:
#         selected_date = datetime.now().date()

#     # Time slots generation (same as original)
#     start_time = datetime.strptime('09:00', '%H:%M')
#     end_time = datetime.strptime('20:30', '%H:%M')
#     time_slots = []
#     current = start_time
#     while current <= end_time:
#         time_slots.append(current.time())
#         current += timedelta(minutes=30)

#     # Room structure (same as original - using floor.rooms JSONField)
#     rooms = floor.rooms or [f"Meeting Room 1 - {floor.name}"]

#     # Get bookings (same as original)
#     bookings = Booking.objects.filter(floor=floor, date=selected_date)

#     # Booked slots structure (same as original)
#     booked_slots = {}
#     for room in rooms:
#         booked_slots[room] = {}
#         for booking in bookings.filter(room=room):
#             time_key = booking.time_slot.strftime('%I:%M %p').lower()
#             if time_key.startswith('0'):
#                 time_key = time_key[1:]
#             booked_slots[room][time_key] = {
#                 'booked_by': booking.user.username if booking.user else booking.booked_by,
#                 'reason': booking.reason,
#                 'status': booking.status,
#             }

#     # POST handling - modified for token approval
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             room = data.get('room')
#             time_str = data.get('time_slot')
#             reason = data.get('reason', '')

#             # Time parsing (same as original)
#             time_match = re.match(r'(\d+)[:\.]?(\d*)\s*(am|pm)', time_str.lower())
#             if time_match:
#                 hours = int(time_match.group(1))
#                 minutes = int(time_match.group(2) or 0)
#                 period = time_match.group(3).lower()
#                 if period == 'pm' and hours < 12:
#                     hours += 12
#                 elif period == 'am' and hours == 12:
#                     hours = 0
#                 time_obj = time(hours, minutes)
#             else:
#                 return JsonResponse({'status': 'error', 'message': 'Invalid time format'})

#             # Check for conflicts (same as original)
#             if Booking.objects.filter(
#                 floor=floor,
#                 room=room,
#                 date=selected_date,
#                 time_slot=time_obj
#             ).exists():
#                 return JsonResponse({'status': 'error', 'message': 'Slot already booked'})

#             # Create booking with token (NEW PART)
#             booking = Booking.objects.create(
#                 floor=floor,
#                 room=room,
#                 time_slot=time_obj,
#                 date=selected_date,
#                 reason=reason,
#                 user=request.user,
#                 booked_by=request.user.company_name,
#                 status='pending',  # Changed to pending for approval
#             )

#             # Generate approval links (NEW)
#             approve_url = request.build_absolute_uri(
#                 reverse('approve_booking', args=[booking.approval_token])
#             )
#             reject_url = request.build_absolute_uri(
#                 reverse('reject_booking', args=[booking.approval_token])
#             )


#             # Send email
#             send_mail(
#                 subject=f'Booking Approval Required: {room} at {time_str}',
#                 message=f"""A new booking requires your approval:

# User: {request.user.company_name}
# Room: {room}
# Date: {selected_date}
# Time: {time_str}
# Reason: {reason}

# Approve: {approve_url}
# Reject: {reject_url}
# """,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[settings.BOOKING_ADMIN_EMAIL],
#                 fail_silently=False,
#             )

#             return JsonResponse({
#                 'status': 'success',
#                 'message': 'Booking submit for approval'
#                 })

#         except Exception as e:
#             return JsonResponse({'status': 'error', 'message': str(e)})

#     # Render same template as original with same context
#     return render(request, 'booking/booking.html', {
#         'floor': floor,
#         'available_floors': available_floors,
#         'selected_date': selected_date,
#         'time_slots': time_slots,
#         'rooms': rooms,
#         'booked_slots': booked_slots,
#         'prev_day': (selected_date - timedelta(days=1)).strftime('%Y-%m-%d'),
#         'next_day': (selected_date + timedelta(days=1)).strftime('%Y-%m-%d'),
#         'user_authenticated': request.user.is_authenticated,
#     })

# @login_required
# @csrf_exempt
# def restricted_booking_view(request, floor_slug):
#     # Initial request debugging
#     print("\n" + "="*50)
#     print(f"=== RESTRICTED_BOOKING_VIEW STARTED ===")
#     print(f"Request Method: {request.method}")
#     print(f"Path: {request.path}")
#     print(f"User: {request.user} (Auth: {request.user.is_authenticated})")
#     print(f"Floor Slug: {floor_slug}")

#     # Get floor and available floors
#     print("\n=== FLOOR INFORMATION ===")
#     floor = get_object_or_404(Floor, slug=floor_slug, is_active=True)
#     print(f"Floor ID: {floor.id}")
#     print(f"Floor Name: {floor.name}")
#     print(f"Booking Type: {floor.booking_type}")

#     available_floors = Floor.objects.filter(is_active=True).order_by('order')
#     print(f"Available Floors: {[f.slug for f in available_floors]}")

#     # Date handling
#     date_str = request.GET.get('date', datetime.now().strftime('%Y-%m-%d'))
#     try:
#         selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
#         print(f"\nUsing provided date: {selected_date}")
#     except ValueError:
#         selected_date = datetime.now().date()
#         print("\nUsing current date as fallback")

#     # Time slots generation
#     print("\n=== TIME SLOTS ===")
#     start_time = datetime.strptime('09:00', '%H:%M')
#     end_time = datetime.strptime('20:30', '%H:%M')
#     time_slots = []
#     current = start_time
#     while current <= end_time:
#         time_slots.append(current.time())
#         current += timedelta(minutes=30)
#     print(f"Generated {len(time_slots)} time slots from {start_time.time()} to {end_time.time()}")

#     # Room structure
#     print("\n=== ROOM CONFIGURATION ===")
#     default_room = f"Meeting Room 1 - {floor.name}"
#     rooms = floor.rooms or [default_room]
#     print(f"Original rooms: {rooms}")

#     if not any(room.startswith("Meeting Room 1") for room in rooms):
#         rooms.insert(0, default_room)
#         floor.rooms = rooms
#         floor.save()
#         print("Added default Meeting Room 1 to rooms list")

#     print(f"Final rooms: {rooms}")

#     # Get bookings
#     print("\n=== EXISTING BOOKINGS ===")
#     bookings = Booking.objects.filter(floor=floor, date=selected_date)
#     print(f"Found {bookings.count()} bookings for {selected_date}")

#     # Booked slots structure
#     booked_slots = {}
#     for room in rooms:
#         booked_slots[room] = {}
#         room_bookings = bookings.filter(room=room)
#         print(f"\nProcessing bookings for room: {room}")
#         print(f"Found {room_bookings.count()} bookings for this room")

#         for booking in room_bookings:
#             time_key = booking.time_slot.strftime('%I:%M %p').lower()
#             if time_key.startswith('0'):
#                 time_key = time_key[1:]
#             booked_slots[room][time_key] = {
#                 'booked_by': booking.user.username if booking.user else booking.booked_by,
#                 'reason': booking.reason,
#                 'status': booking.status,
#             }
#             print(f" - Booked slot: {time_key} by {booked_slots[room][time_key]['booked_by']} ({booking.status})")

#     if request.method == 'POST':
#         print("\n" + "="*50)
#         print("=== PROCESSING POST REQUEST ===")
#         try:
#             # Debug raw request data
#             raw_body = request.body.decode('utf-8')
#             print(f"\nRaw request body:\n{raw_body}")

#             data = json.loads(request.body)
#             print("\nParsed JSON data:")
#             print(json.dumps(data, indent=2))

#             room = data.get('room')
#             time_str = data.get('time_slot')
#             reason = data.get('reason', '')
#             print(f"\nBooking details from request:")
#             print(f"Room: {room}")
#             print(f"Time: {time_str}")
#             print(f"Reason: {reason}")

#             # Time parsing
#             print("\n=== TIME PARSING ===")
#             print(f"Original time string: '{time_str}'")

#             time_match = re.match(r'(\d+)[:\.]\s*(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_str.lower())
#             if not time_match:
#                 time_match = re.match(r'(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_str.lower())
#                 if time_match:
#                     hours = int(time_match.group(1))
#                     minutes = 0
#                     period = time_match.group(2).lower()
#                     print("Matched time without minutes")
#                 else:
#                     print("Failed to parse time string")
#                     return JsonResponse({'status': 'error', 'message': f'Invalid time format: {time_str}'})
#             else:
#                 hours = int(time_match.group(1))
#                 minutes = int(time_match.group(2))
#                 period = time_match.group(3).lower()
#                 print("Matched time with minutes")

#             # Normalize period
#             if period in ['a.m.', 'am']:
#                 period = 'am'
#             elif period in ['p.m.', 'pm']:
#                 period = 'pm'
#             print(f"Normalized period: {period}")

#             # Convert to 24-hour format
#             if period == 'pm' and hours < 12:
#                 hours += 12
#                 print(f"Converted to 24h (PM): {hours}:{minutes}")
#             elif period == 'am' and hours == 12:
#                 hours = 0
#                 print(f"Converted to 24h (AM): {hours}:{minutes}")

#             time_obj = time(hours, minutes)
#             print(f"Final time object: {time_obj}")

#             # Check for conflicts
#             print("\n=== CONFLICT CHECK ===")
#             conflicting_bookings = Booking.objects.filter(
#                 floor=floor,
#                 room=room,
#                 date=selected_date,
#                 time_slot=time_obj
#             )
#             print(f"Found {conflicting_bookings.count()} conflicting bookings")

#             if conflicting_bookings.exists():
#                 print("Conflict detected - slot already booked")
#                 return JsonResponse({'status': 'error', 'message': 'Slot already booked'})

#             # Create booking
#             print("\n=== CREATING BOOKING ===")
#             booking = Booking.objects.create(
#                 floor=floor,
#                 room=room,
#                 time_slot=time_obj,
#                 date=selected_date,
#                 reason=reason,
#                 user=request.user,
#                 booked_by=request.user.company_name if hasattr(request.user, 'company_name') else request.user.username,
#                 status='pending'
#             )
#             print("Booking created successfully")
#             print(f"Booking ID: {booking.id}")
#             print(f"Approval Token: {booking.approval_token}")
#             print(f"Created at: {booking.created_at}")

#             # Generate approval URLs
#             print("\n=== APPROVAL URLS ===")
#             approve_url = request.build_absolute_uri(
#                 reverse('booking:approve_booking', args=[booking.approval_token])
#             )
#             reject_url = request.build_absolute_uri(
#                 reverse('booking:reject_booking', args=[booking.approval_token])
#             )
#             print(f"Approve URL: {approve_url}")
#             print(f"Reject URL: {reject_url}")

#             # Email preparation
#             print("\n=== EMAIL PREPARATION ===")
#             try:
#                 user_full_name = request.user.get_full_name() or request.user.username
#                 company_name = getattr(request.user, 'company_name', "Not specified")
#             except Exception as e:
#                 print(f"Error getting user details: {str(e)}")
#                 user_full_name = request.user.username
#                 company_name = "Not specified"

#             print(f"User: {user_full_name}")
#             print(f"Company: {company_name}")

#             # Email sending
#             print("\n=== SENDING EMAIL ===")
#             try:
#                 send_mail(
#                     subject=f'Booking Approval Required: {room} at {time_str}',
#                     message=f"""A new booking requires your approval:

# User: {user_full_name}
# Company: {company_name}
# Room: {room}
# Date: {selected_date}
# Time: {time_str}
# Reason: {reason}

# Approve: {approve_url}
# Reject: {reject_url}
# """,
#                     from_email=settings.DEFAULT_FROM_EMAIL,
#                     recipient_list=[settings.BOOKING_ADMIN_EMAIL],
#                     fail_silently=False,
#                 )
#                 print("Email sent successfully")
#             except Exception as e:
#                 print(f"Error sending email: {str(e)}")
#                 import traceback
#                 traceback.print_exc()

#             return JsonResponse({
#                 'status': 'success',
#                 'message': 'Booking submitted for admin approval'
#             })

#         except Exception as e:
#             print("\n=== ERROR OCCURRED ===")
#             print(f"Error type: {type(e)}")
#             print(f"Error message: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return JsonResponse({'status': 'error', 'message': str(e)})

#     # GET request handling
#     print("\n=== RENDERING TEMPLATE ===")
#     print(f"Template: booking/restricted_booking_form.html")
#     print(f"Floor: {floor}")
#     print(f"Selected Date: {selected_date}")
#     print(f"Time Slots Count: {len(time_slots)}")
#     print(f"Rooms: {rooms}")
#     print(f"Booked Slots: {json.dumps(booked_slots, indent=2)}")

#     return render(request, 'booking/restricted_booking_form.html', {
#         'floor': floor,
#         'available_floors': available_floors,
#         'date': selected_date,
#         'selected_date': selected_date,
#         'time_slots': time_slots,
#         'rooms': rooms,
#         'booked_slots': booked_slots,
#         'prev_day': (selected_date - timedelta(days=1)).strftime('%Y-%m-%d'),
#         'next_day': (selected_date + timedelta(days=1)).strftime('%Y-%m-%d'),
#         'user_authenticated': request.user.is_authenticated,
#         'user_is_staff': request.user.is_staff,
#     })
def restricted_booking_view(request, floor_slug):
    # Debugging setup
    print("\n\n==== RESTRICTED_BOOKING_VIEW FUNCTION CALLED ====")
    print(f"User: {request.user.username}, Admin: {request.user.is_staff}")
    print(f"Method: {request.method}")
    print(f"Path: {request.path}")
    print(f"User: {request.user} (Auth: {request.user.is_authenticated})")

    # Common setup for both GET and POST
    floor = get_object_or_404(Floor, slug=floor_slug, is_active=True)

    # ADD DEBUG PRINT HERE
    print("DEBUG - floor.booking_type:", floor.booking_type)

    available_floors = Floor.objects.filter(is_active=True).order_by('order')

    # Date handling
    date_str = request.GET.get('date', datetime.now().strftime('%Y-%m-%d'))
    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        selected_date = datetime.now().date()

 # ADD DEBUG PRINT HERE
    print("DEBUG - date:", selected_date)

    # Time slots generation
    start_time = datetime.strptime('09:00', '%H:%M')
    end_time = datetime.strptime('20:30', '%H:%M')
    time_slots = []
    current = start_time
    while current <= end_time:
        time_slots.append(current.time())
        current += timedelta(minutes=30)

    # Room structure
    # Ensure Meeting Room 1 is always included and appears first
    default_room = f"Meeting Room 1 - {floor.name}"
    rooms = floor.rooms or [default_room]

    # Check if Meeting Room 1 is missing from the rooms list
    if not any(room.startswith("Meeting Room 1") for room in rooms):
        # Add Meeting Room 1 at the beginning of the list
        rooms.insert(0, default_room)
        # Update the floor object to persist this change
        floor.rooms = rooms
        floor.save()

    # Get all bookings (both approved and pending) for display in the table
    bookings = Booking.objects.filter(floor=floor, date=selected_date)

    # Booked slots structure
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

    if request.method == 'POST':
        try:
            # Enhanced debugging for POST requests
            print("\n===== POST REQUEST DETAILS =====")
            print(f"Raw request body: {request.body.decode('utf-8')}")

            data = json.loads(request.body)
            print(f"Parsed data: {data}")

            # Check if this is a batch booking request
            is_batch = data.get('is_batch', False)
            batch_size = data.get('batch_size', 1)
            batch_index = data.get('batch_index', 0)
            batch_id = data.get('batch_id', '')

            # Use a cache to track which batch IDs we've already sent emails for
            # This ensures we only send one email per batch, even if the requests come out of order
            sent_batch_emails = cache.get('sent_batch_emails', {})

            # Check if we should send an email for this request
            # Only send email for the first booking in a batch or if we haven't sent an email for this batch yet
            should_send_email = (not is_batch) or (is_batch and batch_id and batch_id not in sent_batch_emails)

            # If this is a batch booking, mark this batch as having sent an email
            if is_batch and batch_id and should_send_email:
                sent_batch_emails[batch_id] = True
                cache.set('sent_batch_emails', sent_batch_emails, 3600)  # Store for 1 hour

            # Get booking details
            room = data.get('room')
            time_str = data.get('time_slot')
            reason = data.get('reason', '')

            print(f"Room: {room}")
            print(f"Time: {time_str}")
            print(f"Reason: {reason}")
            print(f"Is Batch: {is_batch}, Batch Size: {batch_size}, Batch Index: {batch_index}")
            print(f"Should Send Email: {should_send_email}")

            # Time parsing - more flexible pattern to handle different formats
            print(f"Parsing time string: '{time_str}'")
            # Handle formats like "10:30 a.m." or "10:30 am" or "10.30 am"
            time_match = re.match(r'(\d+)[:\.]\s*(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_str.lower())

            if not time_match:
                # Try alternative format without colon/period (e.g., "10 am")
                time_match = re.match(r'(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_str.lower())
                if time_match:
                    hours = int(time_match.group(1))
                    minutes = 0
                    period = time_match.group(2).lower()
                else:
                    return JsonResponse({'status': 'error', 'message': f'Invalid time format: {time_str}'})
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

            time_obj = time(hours, minutes)

            # Check for conflicts
            if Booking.objects.filter(
                floor=floor,
                room=room,
                date=selected_date,
                time_slot=time_obj
            ).exists():
                return JsonResponse({'status': 'error', 'message': 'Slot already booked'})

            # Create booking with pending status and red color
            booking = Booking.objects.create(
                floor=floor,
                room=room,
                time_slot=time_obj,
                date=selected_date,
                reason=reason,
                user=request.user,
                booked_by=request.user.company_name if hasattr(request.user, 'company_name') else request.user.username,
                status='pending'
                # approval_token will be auto-generated in the save method
            )

            # Generate approval links with proper namespace
            approve_url = request.build_absolute_uri(
                reverse('booking:approve_booking', args=[booking.approval_token])
            )
            reject_url = request.build_absolute_uri(
                reverse('booking:reject_booking', args=[booking.approval_token])
            )

            # Only send email for the first booking in a batch or for individual bookings
            if should_send_email:
                # Send email to admin
                print("\n===== SENDING EMAIL =====")
                print(f"From: {settings.DEFAULT_FROM_EMAIL}")
                print(f"To: {settings.BOOKING_ADMIN_EMAIL}")

                # Create a more detailed email message
                try:
                    user_full_name = request.user.get_full_name()
                    if not user_full_name:
                        user_full_name = request.user.username
                except:
                    user_full_name = request.user.username

                try:
                    company_name = request.user.company_name if hasattr(request.user, 'company_name') else "Not specified"
                except:
                    company_name = "Not specified"

                # Print debug info about the booking
                print(f"Booking details:")
                print(f"  User: {user_full_name}")
                print(f"  Company: {company_name}")
                print(f"  Room: {room}")
                print(f"  Date: {selected_date}")
                print(f"  Time: {time_str}")
                print(f"  Reason: {reason}")
                print(f"  Approve URL: {approve_url}")
                print(f"  Reject URL: {reject_url}")

                # Create subject line based on whether this is a batch booking
                subject = ''
                if is_batch and batch_size > 1:
                    subject = f'Booking Approval Required: Multiple Bookings ({batch_size}) - {date_str}'
                else:
                    subject = f'Booking Approval Required: {room} at {time_str} - {date_str}'

                print(f"Subject: {subject}")

                # Create HTML email with buttons that use direct links to API endpoints
                site_url = settings.SITE_URL
                api_approve_url = f"{site_url}/booking/api/approve/{booking.approval_token}/"
                api_reject_url = f"{site_url}/booking/api/reject/{booking.approval_token}/"

                # No batch info in the email
                batch_info = ""

                html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
        .container {{ padding: 20px; max-width: 600px; margin: 0 auto; }}
        .booking-details {{ background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
        .booking-item {{ margin-bottom: 10px; }}
        .booking-label {{ font-weight: bold; }}
        .actions {{ text-align: center; margin: 30px 0; }}
        .btn {{
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            font-size: 16px;
            color: white !important;
            text-align: center;
            min-width: 150px;
        }}
        .approve-btn {{ background-color: #4CAF50; }}
        .reject-btn {{ background-color: #f44336; }}
        .note {{ font-size: 12px; color: #666; margin-top: 20px; }}
        h2 {{ color: #333; text-align: center; }}
        .batch-info {{ background-color: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 15px; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Booking Approval Request</h2>

        {batch_info if is_batch and batch_size > 1 else ""}

        <div class="booking-details">
            <div class="booking-item"><span class="booking-label">User:</span> {user_full_name}</div>
            <div class="booking-item"><span class="booking-label">Company:</span> {company_name}</div>
            <div class="booking-item"><span class="booking-label">Room:</span> {room}</div>
            <div class="booking-item"><span class="booking-label">Date:</span> {selected_date}</div>
            <div class="booking-item"><span class="booking-label">Time:</span> {time_str}</div>
            <div class="booking-item"><span class="booking-label">Reason:</span> {reason}</div>
        </div>

        <div class="actions">
            <a href="{api_approve_url}" class="btn approve-btn">APPROVE</a>
            <a href="{api_reject_url}" class="btn reject-btn">REJECT</a>
        </div>

        <p class="note">Note: Clicking the buttons above will process your decision immediately without requiring additional confirmation.</p>
    </div>
</body>
</html>
"""

                # Plain text version for email clients that don't support HTML
                email_message = f"""A new booking requires your approval:

User: {user_full_name}
Company: {company_name}
Room: {room}
Date: {selected_date}
Time: {time_str}
Reason: {reason}

Approve: {approve_url}
Reject: {reject_url}
"""
                print(f"Message: {email_message}")

                # Use a direct approach to send email
                import smtplib
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart

                try:
                    # More detailed debugging for email sending
                    print(f"Email settings:")
                    print(f"  From: {settings.DEFAULT_FROM_EMAIL}")
                    print(f"  To: {settings.BOOKING_ADMIN_EMAIL}")
                    print(f"  SMTP Host: {settings.EMAIL_HOST}")
                    print(f"  SMTP Port: {settings.EMAIL_PORT}")
                    print(f"  TLS: {settings.EMAIL_USE_TLS}")

                    # Create message container
                    msg = MIMEMultipart('alternative')
                    msg['From'] = settings.DEFAULT_FROM_EMAIL
                    msg['To'] = settings.BOOKING_ADMIN_EMAIL
                    msg['Subject'] = subject

                    # Add plain text and HTML parts
                    msg.attach(MIMEText(email_message, 'plain'))
                    msg.attach(MIMEText(html_message, 'html'))

                    # Connect to SMTP server
                    print("Connecting to SMTP server...")
                    server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
                    server.set_debuglevel(1)  # Add debugging
                    server.ehlo()

                    if settings.EMAIL_USE_TLS:
                        print("Starting TLS...")
                        server.starttls()
                        server.ehlo()

                    print("Logging in...")
                    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

                    print("Sending email...")
                    server.send_message(msg)
                    server.quit()

                    print("Email sent successfully using direct SMTP!")

                except Exception as email_error:
                    print(f"Error sending email: {str(email_error)}")
                    print(f"Error type: {type(email_error)}")
                    import traceback
                    traceback.print_exc()

                    # Try Django's send_mail as a fallback
                    try:
                        print("\nTrying Django's send_mail as a fallback...")
                        from django.core.mail import EmailMultiAlternatives
                        email = EmailMultiAlternatives(
                            subject=subject,
                            body=email_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[settings.BOOKING_ADMIN_EMAIL]
                        )
                        email.attach_alternative(html_message, "text/html")
                        email.send(fail_silently=False)
                        print("Email sent successfully using Django's send_mail!")
                    except Exception as django_email_error:
                        print(f"Django send_mail failed: {str(django_email_error)}")
                        import traceback
                        traceback.print_exc()

                        # Last resort: Try with a different email backend
                        try:
                            print("\nTrying with a different email backend...")
                            from django.core.mail import EmailMessage
                            email = EmailMessage(
                                subject=subject,
                                body=html_message,
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                to=[settings.BOOKING_ADMIN_EMAIL],
                            )
                            email.content_subtype = "html"  # Set the content type to HTML
                            email.send(fail_silently=False)
                            print("Email sent successfully using EmailMessage!")
                        except Exception as email_message_error:
                            print(f"EmailMessage failed: {str(email_message_error)}")
                            traceback.print_exc()
            else:
                print(f"Skipping email for batch booking index {batch_index}")

            return JsonResponse({
                'status': 'success',
                'message': 'Booking submitted for admin approval'
            })

        except Exception as e:
            print(f"Error in booking creation: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)})

    # GET request handling
    return render(request, 'booking/restricted_booking_form.html', {
        'floor': floor,
        'available_floors': available_floors,
        'date': selected_date,  # Changed to match template variable name
        'selected_date': selected_date,
        'time_slots': time_slots,
        'rooms': rooms,
        'booked_slots': booked_slots,
        'prev_day': (selected_date - timedelta(days=1)).strftime('%Y-%m-%d'),
        'next_day': (selected_date + timedelta(days=1)).strftime('%Y-%m-%d'),
        'user_authenticated': request.user.is_authenticated,
        'user_is_staff': request.user.is_staff,
    })




# Approval views
def approve_booking(request, token):
    booking = get_object_or_404(Booking, approval_token=token, status='pending')

    # Print debug info
    print(f"\n===== APPROVING BOOKING =====")
    print(f"Token: {token}")
    print(f"Booking: {booking.id} - {booking.room} at {booking.time_slot} on {booking.date}")
    print(f"Current status: {booking.status}")

    # Update status to approved
    booking.status = 'approved'
    booking.save()

    # Store the last update timestamp in a session variable
    cache.set('last_booking_update', datetime.now().timestamp(), 86400)  # Store for 24 hours

    print(f"New status: {booking.status}")
    print(f"Updated cache timestamp: {cache.get('last_booking_update')}")

    # Send confirmation email to user
    try:
        print(f"Sending approval email to {booking.user.email}")
        send_mail(
            subject ='✅ Booking Approved',
            message=f'Your booking for {booking.room} on {booking.date} was approved!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.user.email],
            fail_silently=False,
        )
        print("Approval email sent successfully")
    except Exception as e:
        print(f"Error sending approval email: {str(e)}")

    # Return response with JavaScript to refresh the parent window and notify other tabs
    return HttpResponse("""
        <script>
            // Store the approval event in localStorage to notify other tabs
            localStorage.setItem('bookingApproved', Date.now());

            // Send a message to all open booking pages
            try {
                // Create a hidden iframe to trigger a refresh on the main booking page
                var iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = '/booking/restricted-booking/2nd-floor/?refresh=' + Date.now();
                document.body.appendChild(iframe);

                // Wait a moment to ensure the iframe loads
                setTimeout(function() {
                    alert('Booking approved! All open booking calendar pages will be updated.');

                    if (window.opener) {
                        // If opened from another window, refresh that window
                        window.opener.location.reload();
                    }

                    // Close this window/tab
                    window.close();
                }, 1000);
            } catch(e) {
                console.error('Error refreshing booking page:', e);
                alert('Booking approved! Please refresh the booking calendar page.');
                window.close();
            }
        </script>
    """)



# API endpoint to check for booking updates
@csrf_exempt
def check_booking_updates(request):
    """
    API endpoint to check if there are any booking updates.
    Returns a JSON response with the last update timestamp.
    """
    last_update = cache.get('last_booking_update', 0)
    client_last_update = float(request.GET.get('last_update', 0))

    # If the server's last update is newer than the client's, return True
    has_updates = last_update > client_last_update

    return JsonResponse({
        'has_updates': has_updates,
        'last_update': last_update
    })

# API endpoint for approving bookings via AJAX or direct link
@csrf_exempt
def api_approve_booking(request, token):
    """
    API endpoint to approve a booking via AJAX or direct link.
    Returns a JSON response or HTML response based on the request.
    """
    try:
        booking = get_object_or_404(Booking, approval_token=token, status='pending')

        # Print debug info
        print(f"\n===== API APPROVING BOOKING =====")
        print(f"Token: {token}")
        print(f"Booking: {booking.id} - {booking.room} at {booking.time_slot} on {booking.date}")
        print(f"Current status: {booking.status}")

        # Update status to approved
        booking.status = 'approved'
        booking.save()

        # Update the cache timestamp
        cache.set('last_booking_update', datetime.now().timestamp(), 86400)
        print(f"New status: {booking.status}")
        print(f"Updated cache timestamp: {cache.get('last_booking_update')}")

        # Send confirmation email to user
        try:
            print(f"Sending approval email to {booking.user.email}")
            send_mail(
                subject ='✅ Booking Approved',
                message=f'Your booking for {booking.room} on {booking.date} was approved!',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.user.email],
                fail_silently=False,
            )
            print("Approval email sent successfully")
        except Exception as e:
            print(f"Error sending approval email: {str(e)}")

        # Check if this is an AJAX request or a direct link click
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

        if is_ajax:
            # Return JSON for AJAX requests
            return JsonResponse({
                'status': 'success',
                'message': 'Booking approved successfully'
            })
        else:
            # Return HTML for direct link clicks - with immediate response
            return HttpResponse("""
                <html>
                <head>
                    <title>Booking Approved</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #4CAF50; color: white; margin: 0; }
                        .success { font-size: 24px; margin-bottom: 20px; }
                        .message { margin-bottom: 30px; }
                    </style>
                    <script>
                        // Execute immediately when page starts loading
                        document.addEventListener('DOMContentLoaded', function() {
                            // Notify any open booking pages about this update
                            localStorage.setItem('bookingApproved', Date.now());

                            // Close the window immediately
                            window.close();
                        });

                        // Attempt to close immediately without waiting for DOMContentLoaded
                        try {
                            localStorage.setItem('bookingApproved', Date.now());
                            window.close();
                        } catch (e) {
                            // Fallback if immediate close fails
                        }
                    </script>
                </head>
                <body>
                    <div class="success">Booking Approved!</div>
                </body>
                </html>
            """)
    except Exception as e:
        print(f"Error approving booking: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
        else:
            return HttpResponse(f"""
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                        .error {{ color: #f44336; font-size: 24px; margin-bottom: 20px; }}
                        .message {{ margin-bottom: 30px; }}
                    </style>
                </head>
                <body>
                    <div class="error">Error Approving Booking</div>
                    <div class="message">{str(e)}</div>
                    <p>Please try again or contact support.</p>
                </body>
                </html>
            """, status=500)

# Batch booking endpoint
@login_required
@csrf_exempt
def batch_booking_view(request, floor_slug):
    """
    API endpoint to handle batch bookings.
    Accepts a POST request with multiple booking slots and processes them as a batch.
    Only sends one email for the entire batch.
    """
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)

    try:
        # Get the floor
        floor = get_object_or_404(Floor, slug=floor_slug, is_active=True)

        # Parse the request data
        data = json.loads(request.body)
        print(f"\n===== BATCH BOOKING REQUEST =====")
        print(f"Data: {data}")

        # Extract common data
        date_str = data.get('date')
        reason = data.get('reason', '')
        bookings_data = data.get('bookings', [])

        # Validate the data
        if not date_str:
            return JsonResponse({'status': 'error', 'message': 'Date is required'}, status=400)

        if not bookings_data or not isinstance(bookings_data, list):
            return JsonResponse({'status': 'error', 'message': 'No booking slots provided'}, status=400)

        print(f"Processing {len(bookings_data)} booking slots")

        # Parse the date
        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid date format'}, status=400)

        # Process each booking
        successful_bookings = []
        failed_bookings = []

        for booking_data in bookings_data:
            room = booking_data.get('room')
            time_str = booking_data.get('time_slot')

            if not room or not time_str:
                failed_bookings.append({
                    'room': room,
                    'time_slot': time_str,
                    'error': 'Missing room or time slot'
                })
                continue

            # Parse the time
            try:
                # Handle formats like "10:30 a.m." or "10:30 am" or "10.30 am"
                time_match = re.match(r'(\d+)[:\.]\s*(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_str.lower())

                if not time_match:
                    # Try alternative format without colon/period (e.g., "10 am")
                    time_match = re.match(r'(\d+)\s*(a\.m\.|p\.m\.|am|pm)', time_str.lower())
                    if time_match:
                        hours = int(time_match.group(1))
                        minutes = 0
                        period = time_match.group(2).lower()
                    else:
                        failed_bookings.append({
                            'room': room,
                            'time_slot': time_str,
                            'error': f'Invalid time format: {time_str}'
                        })
                        continue
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

                time_obj = time(hours, minutes)

                # Check for conflicts
                if Booking.objects.filter(
                    floor=floor,
                    room=room,
                    date=selected_date,
                    time_slot=time_obj
                ).exists():
                    failed_bookings.append({
                        'room': room,
                        'time_slot': time_str,
                        'error': 'Slot already booked'
                    })
                    continue

                # Create the booking
                booking = Booking.objects.create(
                    floor=floor,
                    room=room,
                    time_slot=time_obj,
                    date=selected_date,
                    reason=reason,
                    user=request.user,
                    booked_by=request.user.company_name if hasattr(request.user, 'company_name') else request.user.username,
                    status='pending'
                )

                successful_bookings.append({
                    'room': room,
                    'time_slot': time_str,
                    'booking_id': booking.id,
                    'approval_token': booking.approval_token
                })

            except Exception as e:
                print(f"Error processing booking {room} at {time_str}: {str(e)}")
                failed_bookings.append({
                    'room': room,
                    'time_slot': time_str,
                    'error': str(e)
                })

        # If no bookings were successful, return an error
        if not successful_bookings:
            return JsonResponse({
                'status': 'error',
                'message': 'No bookings could be processed',
                'failed_bookings': failed_bookings
            }, status=400)

        # Send a single email for all successful bookings
        try:
            # Get user details
            try:
                user_full_name = request.user.get_full_name()
                if not user_full_name:
                    user_full_name = request.user.username
            except:
                user_full_name = request.user.username

            try:
                company_name = request.user.company_name if hasattr(request.user, 'company_name') else "Not specified"
            except:
                company_name = "Not specified"

            # Create a list of booking details for the email
            booking_details_html = ""
            booking_details_text = ""

            for i, booking_info in enumerate(successful_bookings):
                # Get the booking object
                booking = Booking.objects.get(id=booking_info['booking_id'])

                # Generate approval links
                approve_url = request.build_absolute_uri(
                    reverse('booking:approve_booking', args=[booking.approval_token])
                )
                reject_url = request.build_absolute_uri(
                    reverse('booking:reject_booking', args=[booking.approval_token])
                )

                # API endpoints
                site_url = settings.SITE_URL
                api_approve_url = f"{site_url}/booking/api/approve/{booking.approval_token}/"
                api_reject_url = f"{site_url}/booking/api/reject/{booking.approval_token}/"

                # Add to HTML version with improved card design
                booking_details_html += f"""
                <div class="booking-card" style="margin-bottom: 25px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; background-color: #ffffff;">
                    <div class="booking-header" style="background-color: #f8f9fa; padding: 12px 15px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; font-size: 16px; color: #333;">Booking {i+1}</div>
                        <div style="font-size: 13px; color: #666; background-color: #e9ecef; padding: 3px 8px; border-radius: 12px;">Pending</div>
                    </div>
                    <div class="booking-body" style="padding: 15px;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <div style="width: 24px; margin-right: 10px; color: #1e88e5;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 10h5v5H7z"/></path></svg></div>
                            <div style="font-size: 15px; color: #333;">{booking_info['room']}</div>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div style="width: 24px; margin-right: 10px; color: #43a047;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></div>
                            <div style="font-size: 15px; color: #333;">{booking_info['time_slot']}</div>
                        </div>
                        <div class="booking-actions" style="display: flex; justify-content: space-between; margin-top: 15px;">
                            <a href="{api_approve_url}" class="btn approve-btn" style="flex: 1; margin-right: 8px; display: inline-block; padding: 10px 0; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; color: white !important; text-align: center; background-color: #4CAF50; border: none; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(76,175,80,0.3);">APPROVE</a>
                            <a href="{api_reject_url}" class="btn reject-btn" style="flex: 1; margin-left: 8px; display: inline-block; padding: 10px 0; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; color: white !important; text-align: center; background-color: #f44336; border: none; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(244,67,54,0.3);">REJECT</a>
                        </div>
                    </div>
                </div>
                """

                # Add to text version
                booking_details_text += f"""
Booking {i+1}: {booking_info['room']} at {booking_info['time_slot']}
  Approve: {approve_url}
  Reject: {reject_url}
"""

            # Create email subject
            subject = f'Booking Approval Required: Multiple Bookings ({len(successful_bookings)})'

            # Create HTML email
            html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; background-color: #f5f7fa; color: #333; }}
        .container {{ padding: 25px; max-width: 650px; margin: 0 auto; }}
        .booking-details {{ background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; }}
        .booking-item {{ margin-bottom: 12px; display: flex; }}
        .booking-label {{ font-weight: 600; min-width: 80px; color: #555; }}
        .actions {{ text-align: center; margin: 30px 0; }}
        .btn {{
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            font-size: 15px;
            color: white !important;
            text-align: center;
            min-width: 150px;
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        .approve-btn {{ background-color: #4CAF50; }}
        .approve-btn:hover {{ background-color: #3d9140; box-shadow: 0 4px 8px rgba(76,175,80,0.3); }}
        .reject-btn {{ background-color: #f44336; }}
        .reject-btn:hover {{ background-color: #e53935; box-shadow: 0 4px 8px rgba(244,67,54,0.3); }}
        .note {{ font-size: 13px; color: #666; margin-top: 25px; background-color: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #4CAF50; }}
        h2 {{ color: #333; text-align: center; margin-bottom: 25px; font-weight: 600; }}
        h3 {{ color: #444; margin-top: 30px; margin-bottom: 20px; font-weight: 500; }}
        .booking-card {{ margin-bottom: 25px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; background-color: #ffffff; }}
        .booking-header {{ background-color: #f8f9fa; padding: 12px 15px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; }}
        .booking-body {{ padding: 15px; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Booking Approval Request</h2>



        <div class="booking-details">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; margin-right: 10px; color: #1976d2;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                <div class="booking-item"><span class="booking-label">User:</span> {user_full_name}</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; margin-right: 10px; color: #0277bd;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></div>
                <div class="booking-item"><span class="booking-label">Company:</span> {company_name}</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; margin-right: 10px; color: #e91e63;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></div>
                <div class="booking-item"><span class="booking-label">Date:</span> {selected_date}</div>
            </div>
            <div style="display: flex; align-items: center;">
                <div style="width: 24px; margin-right: 10px; color: #ff9800;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/></svg></div>
                <div class="booking-item"><span class="booking-label">Reason:</span> {reason}</div>
            </div>
        </div>

        <h3 style="margin-top: 30px;">Booking Details</h3>
        {booking_details_html}

        <p class="note"><strong>Note:</strong> You can approve or reject each booking individually using the buttons above. Approving a booking will confirm the reservation, while rejecting will remove it from the system.</p>
    </div>
</body>
</html>
"""

            # Plain text version
            email_message = f"""Booking Approval Request

User: {user_full_name}
Company: {company_name}
Date: {selected_date}
Reason: {reason}

Booking Details:
{booking_details_text}
"""

            # Send the email
            try:
                # Create message container
                msg = MIMEMultipart('alternative')
                msg['From'] = settings.DEFAULT_FROM_EMAIL
                msg['To'] = settings.BOOKING_ADMIN_EMAIL
                msg['Subject'] = subject

                # Add plain text and HTML parts
                msg.attach(MIMEText(email_message, 'plain'))
                msg.attach(MIMEText(html_message, 'html'))

                # Connect to SMTP server
                server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
                server.set_debuglevel(1)  # Add debugging
                server.ehlo()

                if settings.EMAIL_USE_TLS:
                    server.starttls()
                    server.ehlo()

                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                server.send_message(msg)
                server.quit()

                print("Batch booking email sent successfully using direct SMTP!")

            except Exception as email_error:
                print(f"Error sending batch booking email: {str(email_error)}")

                # Try Django's send_mail as a fallback
                try:
                    from django.core.mail import EmailMultiAlternatives
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=email_message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[settings.BOOKING_ADMIN_EMAIL]
                    )
                    email.attach_alternative(html_message, "text/html")
                    email.send(fail_silently=False)
                    print("Batch booking email sent successfully using Django's send_mail!")
                except Exception as django_email_error:
                    print(f"Django send_mail failed for batch booking: {str(django_email_error)}")

                    # Last resort
                    try:
                        from django.core.mail import EmailMessage
                        email = EmailMessage(
                            subject=subject,
                            body=html_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[settings.BOOKING_ADMIN_EMAIL],
                        )
                        email.content_subtype = "html"
                        email.send(fail_silently=False)
                        print("Batch booking email sent successfully using EmailMessage!")
                    except Exception as email_message_error:
                        print(f"EmailMessage failed for batch booking: {str(email_message_error)}")

        except Exception as e:
            print(f"Error sending batch booking email: {str(e)}")

        # Return success response
        return JsonResponse({
            'status': 'success',
            'message': f'Successfully processed {len(successful_bookings)} bookings',
            'success_count': len(successful_bookings),
            'failed_count': len(failed_bookings),
            'successful_bookings': successful_bookings,
            'failed_bookings': failed_bookings
        })

    except Exception as e:
        print(f"Error in batch booking: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

# API endpoint for rejecting bookings via AJAX or direct link
@csrf_exempt
def api_reject_booking(request, token):
    """
    API endpoint to reject a booking via AJAX or direct link.
    Returns a JSON response or HTML response based on the request.
    """
    try:
        booking = get_object_or_404(Booking, approval_token=token, status='pending')

        # Print debug info
        print(f"\n===== API REJECTING BOOKING =====")
        print(f"Token: {token}")
        print(f"Booking: {booking.id} - {booking.room} at {booking.time_slot} on {booking.date}")

        # Store booking info before deleting
        room = booking.room
        date = booking.date
        user_email = booking.user.email if booking.user and hasattr(booking.user, 'email') else None

        # Delete the booking
        booking.delete()
        print(f"Booking deleted")

        # Update the cache timestamp
        cache.set('last_booking_update', datetime.now().timestamp(), 86400)
        print(f"Updated cache timestamp: {cache.get('last_booking_update')}")

        # Send rejection email to user
        if user_email:
            try:
                print(f"Sending rejection email to {user_email}")
                send_mail(
                    subject='❌ Booking Rejected',
                    message=f'Your booking for {room} on {date} was rejected.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    fail_silently=False,
                )
                print("Rejection email sent successfully")
            except Exception as e:
                print(f"Error sending rejection email: {str(e)}")

        # Check if this is an AJAX request or a direct link click
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

        if is_ajax:
            # Return JSON for AJAX requests
            return JsonResponse({
                'status': 'success',
                'message': 'Booking rejected successfully'
            })
        else:
            # Return HTML for direct link clicks - with immediate response
            return HttpResponse("""
                <html>
                <head>
                    <title>Booking Rejected</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f44336; color: white; margin: 0; }
                        .success { font-size: 24px; margin-bottom: 20px; }
                        .message { margin-bottom: 30px; }
                    </style>
                    <script>
                        // Execute immediately when page starts loading
                        document.addEventListener('DOMContentLoaded', function() {
                            // Notify any open booking pages about this update
                            localStorage.setItem('bookingRejected', Date.now());

                            // Close the window immediately
                            window.close();
                        });

                        // Attempt to close immediately without waiting for DOMContentLoaded
                        try {
                            localStorage.setItem('bookingRejected', Date.now());
                            window.close();
                        } catch (e) {
                            // Fallback if immediate close fails
                        }
                    </script>
                </head>
                <body>
                    <div class="success">Booking Rejected!</div>
                </body>
                </html>
            """)
    except Exception as e:
        print(f"Error rejecting booking: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
        else:
            return HttpResponse(f"""
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                        .error {{ color: #f44336; font-size: 24px; margin-bottom: 20px; }}
                        .message {{ margin-bottom: 30px; }}
                    </style>
                </head>
                <body>
                    <div class="error">Error Rejecting Booking</div>
                    <div class="message">{str(e)}</div>
                    <p>Please try again or contact support.</p>
                </body>
                </html>
            """, status=500)

def reject_booking(request, token):
    booking = get_object_or_404(Booking, approval_token=token, status='pending')

    # Print debug info
    print(f"\n===== REJECTING BOOKING =====")
    print(f"Token: {token}")
    print(f"Booking: {booking.id} - {booking.room} at {booking.time_slot} on {booking.date}")

    # Store booking info before deleting
    room = booking.room
    date = booking.date
    user_email = booking.user.email if booking.user and hasattr(booking.user, 'email') else None

    # Delete the booking
    booking.delete()
    print(f"Booking deleted")

    # Store the last update timestamp in a session variable
    cache.set('last_booking_update', datetime.now().timestamp(), 86400)  # Store for 24 hours
    print(f"Updated cache timestamp: {cache.get('last_booking_update')}")

    # Send rejection email to user
    if user_email:
        try:
            print(f"Sending rejection email to {user_email}")
            send_mail(
                subject='❌ Booking Rejected',
                message=f'Your booking for {room} on {date} was rejected.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user_email],
                fail_silently=False,
            )
            print("Rejection email sent successfully")
        except Exception as e:
            print(f"Error sending rejection email: {str(e)}")

    # Return response with JavaScript to refresh the parent window and notify other tabs
    return HttpResponse("""
        <script>
            // Store the rejection event in localStorage to notify other tabs
            localStorage.setItem('bookingRejected', Date.now());

            // Send a message to all open booking pages
            try {
                // Create a hidden iframe to trigger a refresh on the main booking page
                var iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = '/booking/restricted-booking/2nd-floor/?refresh=' + Date.now();
                document.body.appendChild(iframe);

                // Wait a moment to ensure the iframe loads
                setTimeout(function() {
                    alert('Booking rejected! All open booking calendar pages will be updated.');

                    if (window.opener) {
                        // If opened from another window, refresh that window
                        window.opener.location.reload();
                    }

                    // Close this window/tab
                    window.close();
                }, 1000);
            } catch(e) {
                console.error('Error refreshing booking page:', e);
                alert('Booking rejected! Please refresh the booking calendar page.');
                window.close();
            }
        </script>
    """)