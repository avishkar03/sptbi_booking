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


def restricted_booking_view(request, floor_slug):
    # Debugging setup
    print("\n===== NEW REQUEST =====")
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
    rooms = floor.rooms or [f"Meeting Room 1 - {floor.name}"]

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

            room = data.get('room')
            time_str = data.get('time_slot')
            reason = data.get('reason', '')

            print(f"Room: {room}")
            print(f"Time: {time_str}")
            print(f"Reason: {reason}")

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

            # Send email to admin
            print("\n===== SENDING EMAIL =====")
            print(f"From: {settings.DEFAULT_FROM_EMAIL}")
            print(f"To: {settings.BOOKING_ADMIN_EMAIL}")
            print(f"Subject: Booking Approval Required: {room} at {time_str}")

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

            # Create HTML email with buttons that use direct links to API endpoints
            site_url = settings.SITE_URL
            api_approve_url = f"{site_url}/booking/api/approve/{booking.approval_token}/"
            api_reject_url = f"{site_url}/booking/api/reject/{booking.approval_token}/"

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
    </style>
</head>
<body>
    <div class="container">
        <h2>Booking Approval Request</h2>

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
                msg['Subject'] = f'Booking Approval Required: {room} at {time_str}'

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
                        subject=f'Booking Approval Required: {room} at {time_str}',
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
                            subject=f'Booking Approval Required: {room} at {time_str}',
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