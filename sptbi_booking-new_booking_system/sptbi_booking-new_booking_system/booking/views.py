import json
import re
import logging
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render, get_object_or_404
from .models import aTimeSlot, Floor, Booking
from django.contrib.auth import login, logout, get_user_model
from django.contrib.auth.models import User
from datetime import datetime, timedelta, timezone
import datetime as dt  # Import datetime module with an alias
from django.urls import reverse
from django.core.paginator import Paginator
from django.db.models import F
import xlsxwriter
from mainsite.models import *
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.dateparse import parse_date


# Create your views here.
User = get_user_model()

logger = logging.getLogger(__name__)

def index(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    about = About.objects.all()
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    # list of times from 9am to 9pm in intervals of 30 mins
    times = ["09.00 am", "09.30 am", "10.00 am", "10.30 am", "11.00 am", "11.30 am", "12.00 pm", "12.30 pm", "01.00 pm", "01.30 pm", "02.00 pm", "02.30 pm",
             "03.00 pm", "03.30 pm", "04.00 pm", "04.30 pm", "05.00 pm", "05.30 pm", "06.00 pm", "06.30 pm", "07.00 pm", "07.30 pm", "08.00 pm", "08.30 pm"]
    date = datetime.now().strftime("%Y-%m-%d")
    status = 0
    user = request.user
    if user.is_authenticated:
        status = User.objects.get(email=user.email).lock
    if request.method == "POST":
        if 'form1' in request.POST:
            date = request.POST.get("dateinput")
            print(date)
        elif 'form2' in request.POST:
            user = request.user
            if not user.is_authenticated:
                return redirect("login")
            selected_ids = request.POST.get('selected_ids')
            if selected_ids == "":
                return redirect('index')
            l = selected_ids.split(",")
            room = 0
            date = request.POST.get('dateinput')
            name = request.POST.get('name')
            month = request.POST.get('month')
            year = request.POST.get('year')
            reason = request.POST.get('reason')
            u = User.objects.get(email=user.email)
            print(u)
            for i in l:
                j = i.split("-")
                slot = j[1]
                room = int(j[2])
                print(slot, room, date)
                b = aTimeSlot.objects.filter(slot=slot, room=room, date=date)
                if b:
                    continue
                else:
                    x = aTimeSlot.objects.create(
                        slot=slot, room=room, date=date, name=name, email=user.email, month=month, year=year, reason=reason)
                    u.free_slots += 0.5
                    x.save()
                    u.save()
                    if u.free_slots == u.total:
                        u.lock = 1
                        u.save()
                        break
            if u.free_slots > u.total:
                u.lock = 1
                u.save()
        elif 'form4' in request.POST:
            date = request.POST.get("dateinput")
    timeslots = aTimeSlot.objects.filter(date=date)
    num = range(24)
    r = range(4)
    return render(request, 'booking.html', {'about': about, 'timeslots': timeslots, 'num': num, 'r': r, 'date': date, 'times': times, 'status': status, 'pg': pg, 'count': count, 'events': events})


def delete_slot(request):
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    events = Event.objects.all()
    # events = sorted(events, key=lambda x: x.orderno)
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    # pg = sorted(pg, key=lambda x: x.orderno)
    times = ["09.00 am", "09.30 am", "10.00 am", "10.30 am", "11.00 am", "11.30 am", "12.00 pm", "12.30 pm", "01.00 pm", "01.30 pm", "02.00 pm", "02.30 pm",
             "03.00 pm", "03.30 pm", "04.00 pm", "04.30 pm", "05.00 pm", "05.30 pm", "06.00 pm", "06.30 pm", "07.00 pm", "07.30 pm", "08.00 pm", "08.30 pm"]
    date = datetime.now().strftime("%Y-%m-%d")
    if request.method == "POST":
        if 'form1' in request.POST:
            date = request.POST.get("dateinput")
            print(date)
        elif 'form2' in request.POST:
            user = request.user
            if not user.is_authenticated:
                return redirect("login")
            selected_ids = request.POST.get('selected_ids')
            if selected_ids == "":
                return redirect('index')
            l = selected_ids.split(",")
            room = 0
            date = request.POST.get('dateinput')
            u = User.objects.get(email=user.email)
            for i in l:
                j = i.split("-")
                slot = j[1]
                room = int(j[2])
                a = aTimeSlot.objects.filter(slot=slot, room=room, date=date)
                a.delete()
                u.free_slots += 0.5
                u.charges = u.free_slots * -250 if u.free_slots < 0 else 0
    timeslots = aTimeSlot.objects.filter(date=date)
    num = range(24)
    r = range(4)
    return render(request, 'deletecal.html', {'timeslots': timeslots, 'num': num, 'r': r, 'date': date, 'times': times, 'pg': pg, 'count': count, 'events': events})


@login_required
def booking(request):
    """Main booking view that redirects to the first active floor."""
    first_floor = Floor.objects.filter(is_active=True).order_by('order').first()
    if first_floor:
        return redirect('floor_booking', floor_slug=first_floor.slug)
    return render(request, 'booking/no_floors.html')

def floor_booking(request, floor_slug):
    """Handle booking for a specific floor."""
    print("In here")
    floor = get_object_or_404(Floor, slug=floor_slug, is_active=True)
    
    # Get all available floors for the dropdown
    available_floors = Floor.objects.filter(is_active=True).order_by('order')
    
    # Get the date from query params or use today
    date_str = request.GET.get('date', datetime.now().strftime('%Y-%m-%d'))
    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        selected_date = datetime.now()
    
    # Generate time slots from 9 AM to 8:30 PM in 30-minute intervals
    start_time = datetime.strptime('09:00', '%H:%M')
    end_time = datetime.strptime('20:30', '%H:%M')
    time_slots = []
    current = start_time
    while current <= end_time:
        time_slots.append(current.time())  # Store as time objects
        current += timedelta(minutes=30)
    
    # Get rooms for this floor from the model
    rooms = floor.rooms or [f"Meeting Room 1 - {floor.name}"]
    
    # Get all bookings for this floor on the selected date - NO AUTHENTICATION FILTER
    bookings = Booking.objects.filter(
        floor=floor,
        date=selected_date.date(),      
        # status= 'approved'              #only show approved bookings
    ).select_related('floor')
    
    # Debug logging for booking data
    logger.info(f"Found {bookings.count()} bookings for {floor_slug} on {selected_date.date()}")
    logger.info(f"User is authenticated: {request.user.is_authenticated}")
    
    for booking in bookings:
        logger.info(f"DEBUG: Booking found: room={booking.room}, time={booking.time_slot}, reason='{booking.reason}', date={booking.date}")
    
    # Create a dictionary of booked slots using consistent time format
    booked_slots = {}
    for room in rooms:
        booked_slots[room] = {}
        room_bookings = bookings.filter(room=room)
        for booking in room_bookings:
            time_key = booking.time_slot.strftime('%I:%M %p').lower()  # Format as "h:i am/pm"
            if time_key.startswith('0'):
                time_key = time_key[1:]  # Remove leading zero for hours
            
            logger.info(f"DEBUG: Adding booking to UI: room={room}, time_key='{time_key}', reason='{booking.reason}'")
            # booked_slots[room][time_key] = {
            #     'booked_by': booking.booked_by,
            #     'reason': booking.reason  # Include the reason
            # }
            booked_slots[room][time_key] = {
                'booked_by': booking.user.username if booking.user  else booking.booked_by,
                'user_id' : booking.user.id if booking.user else None,
                'reason': booking.reason,

            }
            
    # After creating the booked_slots dictionary, log its contents
    for room in booked_slots:
        for time_key in booked_slots[room]:
            logger.info(f"DEBUG: Final booked_slots: room={room}, time_key='{time_key}', reason='{booked_slots[room][time_key]['reason']}'")
    
    # Previous and next day for navigation
    prev_day = (selected_date - timedelta(days=1)).strftime('%Y-%m-%d')
    next_day = (selected_date + timedelta(days=1)).strftime('%Y-%m-%d')

    context = {
        'floor': floor,
        'available_floors': available_floors,
        'selected_date': selected_date,
        'time_slots': time_slots,
        'rooms': rooms,
        'booked_slots': booked_slots,
        'prev_day': prev_day,
        'next_day': next_day,
        'user_authenticated': request.user.is_authenticated,
    }
    
    # Log the booking data
    logger.info(f"Booking data for {floor_slug} on {selected_date}: {booked_slots}")
    
    # DEBUG: Log sample time format for troubleshooting
    if time_slots:
        sample_time = time_slots[0]
        h_i_format = sample_time.strftime('%H:%M')  # 24-hour
        i_a_format = sample_time.strftime('%I:%M %p').lower()  # 12-hour with am/pm
        logger.info(f"Time format comparison - 24h: {h_i_format}, 12h: {i_a_format}")

        # Add JSON data for JS use
#     context['booked_slots_json'] = json.dumps([
#     {
#         'room': b.room,
#         'time_slot': b.time_slot.strftime('%I:%M %p'),
#         'date': str(b.date),
#         'floor': b.floor.slug,
#         'status': b.status,
#     }
#     for b in bookings
# ])


    return render(request, 'booking/booking.html', context)

@login_required
def save_cell_content(request):
    """Save booking information."""
    if request.method == 'POST':
        data = json.loads(request.body)
        # Your existing save logic here
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def profile(request):
    """User profile view."""
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)            #commented out for now
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)                    #commented out for now
    mon = datetime.now().strftime("%Y-%m-%d").split("-")[1]
    y = datetime.now().strftime("%Y-%m-%d").split("-")[0]
    objs = User.objects.filter(is_superuser=False)
    active_objs = []
    print(objs)
    for o in objs:
        if o.total > 0:
            active_objs.append(o)
        o.free_slots = aTimeSlot.objects.filter(
            email=o.email, month=mon, year=y).count()*0.5
        o.charges = 0 if o.free_slots < o.total else (o.free_slots - o.total) * 250
        o.save()
    if request.method == "POST":
        if 'form1' in request.POST:
            email = request.POST.get("email")
            return redirect(reverse('edit_user') + f'?email={email}')
        elif 'form2' in request.POST:
            return redirect('change_password')
        elif 'form4' in request.POST:
            email = request.POST.get("email")
            u = User.objects.get(email=email)
            u.lock = int(request.POST.get("lock"))
            u.save()
    user = request.user
    free_hours = User.objects.get(email=user.email).free_slots
    charges = User.objects.get(email=user.email).charges
    total = User.objects.get(email=user.email).total
    # objs = User.objects.all()
    date = datetime.now().strftime("%Y-%m-%d")
    month = date.split("-")[1]
    year = date.split("-")[0]
    if month == "01":
        previous_month = "12"
        # Subtract 1 from the year for January
        previous_year = str(int(year) - 1)
    else:
        previous_month = str(int(month) - 1).zfill(2)
        previous_year = year
    print(user.email)
    timeslots_tm = aTimeSlot.objects.filter(
        email=user.email, month=month, year=year)
    print(f"timeslots_tm : {timeslots_tm}")
    timeslots = sorted(timeslots_tm, key=lambda obj: obj.date)
    timeslots_pm = aTimeSlot.objects.filter(
        email=user.email, month=previous_month, year=previous_year)
    timeslotspm = sorted(timeslots_pm, key=lambda obj: obj.date)
    timeslots.extend(timeslotspm)
    per_page = 10

    paginator = Paginator(timeslots, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    logs = page_obj.object_list
    if not user.is_authenticated:
        return redirect("login")
    
    companies = aTimeSlot.objects.values('name').distinct()
    keyset = Booking.objects.values('booked_by')
    # companies = [key['booked_by'] for key in keyset]
    # companies = list(set(companies))
    print({'logs': logs, 'page_obj': page_obj, 'free_hours': free_hours, 'charges': charges, "objs": active_objs, 'total': total, 'pg': pg, 'count': count, 'events': events, 'companies':companies})
    return render(request, 'booking/profile.html', {'logs': logs, 'page_obj': page_obj, 'free_hours': free_hours, 'charges': charges, "objs": active_objs, 'total': total, 'pg': pg, 'count': count, 'events': events, 'companies':companies})


def edit_user(request):
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    email = request.GET.get('email')
    u = User.objects.get(email=email)
    x = u.total
    us = User.objects.get(email=email)
    if request.method == "POST":
        if 'form1' in request.POST:
            first_name = request.POST.get('first_name')
            email = request.POST.get("email")
            free = request.POST.get("free")
            u.company_name = first_name
            u.email = email
            u.total = free
            u.save()
            return redirect('profile')
        else:
            print('Hello')
            email = request.POST.get('email')
            us = User.objects.get(email=email)
            a = aTimeSlot.objects.filter(email=email)
            u = User.objects.get(email=email)
            us.delete()
            u.delete()
            a.delete()
            return redirect('profile')
    return render(request, 'booking/edituser.html', {'x': x, 'us': us, 'pg': pg, 'count': count, 'events': events})


def change_password(request):
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    if request.method == "POST":
        password = request.POST.get('password')
        confirmpassword = request.POST.get('confirmpassword')
        if password == confirmpassword:
            user = request.user
            user.password = password
            user.save()
            login(request, user)
            return redirect('profile')
        return render(request, 'booking/changepassword.html', {'error': 'Passwords do not match', 'pg': pg, 'count': count, 'events': events})
    return render(request, 'booking/changepassword.html', {'pg': pg, 'count': count, 'events':events})


def success(request):
    """Success page after completing an action."""
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    return render(request, 'booking/success.html', {'pg': pg, 'count': count, 'events': events})


def download_table_as_excel(request):
    objs = User.objects.all()

    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename="Charges.xlsx"'

    workbook = xlsxwriter.Workbook(response, {'remove_timezone': True})
    worksheet = workbook.add_worksheet()

    # Write the table headers
    headers = ['Company Name', 'Email',
               'Hours Used', 'Total Free Hours', 'Charges']
    for col, header in enumerate(headers):
        worksheet.write(0, col, header)

    # Write the table data
    for row, obj in enumerate(objs, start=1):
        data = [obj.company_name, obj.email,
                obj.free_slots, obj.total, str(obj.charges)+'0']
        for col, value in enumerate(data):
            worksheet.write(row, col, value)

    workbook.close()
    return response

def download_log(request):
    user = request.user
    currentmonth = datetime.now().strftime("%Y-%m-%d").split("-")[1]
    currentyear = datetime.now().strftime("%Y-%m-%d").split("-")[0]
    log = aTimeSlot.objects.filter(email=user.email, month=currentmonth, year=currentyear)
    print(log)
    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename="Booking Log SPTBI.xlsx"'

    workbook = xlsxwriter.Workbook(response, {'remove_timezone': True})
    worksheet = workbook.add_worksheet()

    rooms = ['Meeting Room 1 - 1st Floor', 'Meeting Room 1 - 2nd Floor', 'Meeting Room 2 - 2nd Floor', 'Meeting Room - 8th Floor']
    headers = ['Date', 'Slot',
               'Room', 'Reason']
    for col, header in enumerate(headers):
        worksheet.write(0, col, header)
    for row, l in enumerate(log, start=1):
        data = [l.date, l.slot,
                rooms[l.room], l.reason]
        for col, value in enumerate(data):
            worksheet.write(row, col, value)
    workbook.close()
    return response

def download_log_2(request):
    flag = 0
    if request.method == 'POST':
        s_month = re.split('-', request.POST.get('start'))
        e_month = re.split('-', request.POST.get('end'))
        start_month = s_month[1]
        start_year = s_month[0]

        end_month = e_month[1]
        end_year = e_month[0]

        option = request.POST.get('selected')
        print(option)
        cnt = []
        name = []
        

        if option != "all":
            log = aTimeSlot.objects.filter(name=option,month__lte=end_month, month__gte=start_month, year__lte=end_year, year__gte=start_year)
        else:
            flag+=1 
            log = aTimeSlot.objects.filter(month__lte=end_month, month__gte=start_month, year__lte=end_year, year__gte=start_year)
            for l in log.distinct():
                name.append(l.name)
            name=set(name)
            name=list(name)
            print(name)
            print("Count = ", cnt)

            for i in name:
                log2 = aTimeSlot.objects.filter(name=i,month__lte=end_month, month__gte=start_month, year__lte=end_year, year__gte=start_year)
                cnt.append((log2.count() * 30 ) / 60)

            result =  {name[i]: cnt[i] for i in range(len(name))}
            print(result)

        response = HttpResponse(content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="Booking Log SPTBI.xlsx"'

        workbook = xlsxwriter.Workbook(response, {'remove_timezone': True})
        worksheet = workbook.add_worksheet()

        rooms = ['Meeting Room 1 - 1st Floor', 'Meeting Room 1 - 2nd Floor', 'Meeting Room 2 - 2nd Floor', 'Meeting Room - 8th Floor']
        headers = ['Company Name','Date', 'Slot','Room', 'Reason']
        for col, header in enumerate(headers):
            worksheet.write(0, col, header)
        for row, l in enumerate(log, start=1):
            data = [l.name,l.date, l.slot,
                    rooms[l.room], l.reason,]
            for col, value in enumerate(data):
                worksheet.write(row, col, value)

        if flag > 0:
            worksheet2 = workbook.add_worksheet('user_logs')

            for key, v in result.items():
                print(key, v)

            worksheet2.write(0, 0, 'Company')
            worksheet2.write(0, 1, 'Hours')

            # Write data from the dictionary
            row = 1

            for company, value in result.items():
                worksheet2.write(row, 0, company)
                worksheet2.write(row, 1, value)
                row += 1

        worksheet.autofilter(0, 0, 0,0)
        workbook.close()
        return response

def download_log_user(request):
    user = request.user
    if request.method == 'POST':
        s_month = re.split('-', request.POST.get('start'))
        e_month = re.split('-', request.POST.get('end'))

        start_month = s_month[1]
        start_year = s_month[0]
        end_month = e_month[1]
        end_year = e_month[0]

        option = request.POST.get('selected')
        print(option)
       
        log = aTimeSlot.objects.filter(email=user.email,month__lte=end_month, month__gte=start_month, year__lte=end_year, year__gte=start_year)

        response = HttpResponse(content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="Booking Log SPTBI.xlsx"'

        workbook = xlsxwriter.Workbook(response, {'remove_timezone': True})
        worksheet = workbook.add_worksheet()

        rooms = ['Meeting Room 1 - 1st Floor', 'Meeting Room 1 - 2nd Floor', 'Meeting Room 2 - 2nd Floor', 'Meeting Room - 8th Floor']
        headers = ['Company Name','Date', 'Slot','Room', 'Reason']
        for col, header in enumerate(headers):
            worksheet.write(0, col, header)
        for row, l in enumerate(log, start=1):
            data = [l.name,l.date, l.slot,
                    rooms[l.room], l.reason,]
            for col, value in enumerate(data):
                worksheet.write(row, col, value)

        workbook.close()
        return response

@login_required
def delete(request):
    """Delete booking view."""
    if request.method == 'POST':
        # Your existing delete logic here
        pass
    return render(request, 'booking/delete.html')

@login_required
def add_column(request):
    """Add a new room column to the floor."""
    if request.method == 'POST' and request.user.is_staff:
        try:
            data = json.loads(request.body)
            floor = get_object_or_404(Floor, slug=data['floor'])
            
            # Update the rooms list for this floor
            rooms = floor.rooms or []
            rooms.append(data['room_name'])
            floor.rooms = rooms
            floor.save()
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@login_required
@staff_member_required
def delete_columns(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            floor_slug = data.get('floor')
            column_indices = data.get('column_indices', [])

            floor = Floor.objects.get(slug=floor_slug)
            
            # Get the rooms list from the JSONField
            rooms = floor.rooms or []
            
            # Remove the rooms at the specified indices
            for index in sorted(column_indices, reverse=True):
                if 0 <= index - 1 < len(rooms):  # Subtract 1 because first column is time slot
                    rooms.pop(index - 1)
            
            # Update the floor with remaining rooms
            floor.rooms = rooms
            floor.save()
            
            # Delete associated bookings for the removed rooms
            Booking.objects.filter(floor=floor).delete()
            
            return JsonResponse({'status': 'success'})
        except Floor.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Floor not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@staff_member_required
def save_columns(request):
    """Save the column structure for a floor."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            floor_slug = data.get('floor_slug')
            rooms = data.get('rooms', [])

            # Get or create the floor
            floor = Floor.objects.get(slug=floor_slug)
            
            # Update the rooms list
            floor.rooms = rooms
            floor.save()
            
            return JsonResponse({'status': 'success'})
        except Floor.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Floor not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
# def save_booking(request):
#     """Save multiple bookings."""
#     if request.method == 'POST':
#         try:
#             bookings_data = json.loads(request.body)
#             if not isinstance(bookings_data, list):
#                 return JsonResponse({
#                     'status': 'error',
#                     'message': 'Data should be a list of bookings'
#                 }, status=400)
#             for data in bookings_data:
#                 if not isinstance(data, dict):
#                     return JsonResponse({
#                         'status': 'error',
#                         'message': 'Each booking should be a dictionary'
#                     }, status=400)
#                 floor = get_object_or_404(Floor, slug=data['floor'])
                
#                 # Parse the time slot
#                 time_str = data['time_slot'].strip()
#                 logger.info(f"Processing time string: '{time_str}'")
                
#                 # Extract components with better regex
#                 import re
#                 time_match = re.match(r'(\d+)[:\.]?(\d*)\s*(am|pm)', time_str.lower())
                
#                 if time_match:
#                     hours = int(time_match.group(1))
#                     minutes = int(time_match.group(2) or 0)
#                     period = time_match.group(3).lower()
                    
#                     # Convert to 24-hour format if pm
#                     if period == 'pm' and hours < 12:
#                         hours += 12
#                     elif period == 'am' and hours == 12:
#                         hours = 0
                        
#                     # Create a valid time object
#                     time_obj = dt.time(hours, minutes)
#                     logger.info(f"Successfully parsed time: {time_obj}")
#                 else:
#                     logger.error(f"Failed to parse time string: {time_str}")
#                     return JsonResponse({
#                         'status': 'error',
#                         'message': f"Could not parse time string: {time_str}. Expected format: HH:MM am/pm"
#                     }, status=400)
                
#                 # Get the date from the query parameters or use current date
#                 selected_date = data.get('date')
#                 booking_date = datetime.now().date()
#                 if selected_date:
#                     try:
#                         booking_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
#                     except ValueError:
#                         # If date parsing fails, use current date
#                         pass
                
#                 # Create the booking
#                 booking = Booking.objects.create(
#                     floor=floor,
#                     room=data['room'],
#                     time_slot=time_obj,
#                     reason=data['reason'],
#                     user=request.user,
#                     booked_by=request.user.company_name,
#                    # email=request.user.email,  # optional: ensure email is saved
#                     date=booking_date,
#                     #status='approved',
#                     # status='pending',
#                 )
#                 # # After creating the booking, send email to admin
#                 # approve_url = request.build_absolute_uri(reverse('booking:approve-booking', args=[booking.id]))
#                 # reject_url = request.build_absolute_uri(reverse('booking:reject-booking', args=[booking.id]))


#      # Send email notification to admin
# #             send_mail(
# #             subject='New Room Booking Request',
# #             message=f"""A new room booking has been requested by {request.user.username}.

# #     Floor: {floor.name}
# #     Room: {data['room']}
# #     Time Slot: {time_obj}
# #     Date: {booking_date}
# #     Reason: {data['reason']}


# #     Click below to respond to this booking:
# # ✅ Approve: {approve_url}
# # ❌ Reject: {reject_url}
# #                     """,
# #                     from_email=settings.DEFAULT_FROM_EMAIL,
# #                     recipient_list=['avishkar.more@spit.ac.in', 'sheshasai.reddy@spit.ac.in', 'sahil.nannaware@spit.ac.in'],  # Update this with the actual admin email
# #                     fail_silently=False,
# #     # Please log in to the admin panel to approve or reject this request.
# #     # """,
# #     # from_email=settings.DEFAULT_FROM_EMAIL,
# #     # recipient_list=['sahil.nannaware@spit.ac.in'],
# #     # fail_silently=False,
# # )

#             return JsonResponse({
#                 'status': 'success',
#                 'booked_by': bookings_data[-1]['reason']  # Return the last booking reason
#                 })
            
#         except Floor.DoesNotExist:
#             return JsonResponse({
#                 'status': 'error',
#                 'message': 'Floor not found'
#             }, status=404)
#         except Exception as e:
#             return JsonResponse({
#                 'status': 'error',
#                 'message': str(e)
#             }, status=400)
    
#     return JsonResponse({
#         'status': 'error',
#         'message': 'Invalid request method'
# }, status=405)
def save_booking(request):
    """Save multiple bookings."""
    if request.method == 'POST':
        try:
            bookings_data = json.loads(request.body)
            if not isinstance(bookings_data, list):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Data should be a list of bookings'
                }, status=400)
            
            for data in bookings_data:
                if not isinstance(data, dict):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Each booking should be a dictionary'
                    }, status=400)

                floor = get_object_or_404(Floor, slug=data['floor'])
                
                # Parse time string
                time_str = data['time_slot'].strip()
                logger.info(f"Processing time string: '{time_str}'")

                time_match = re.match(r'(\d+)[:\.]?(\d*)\s*(am|pm)', time_str.lower())
                
                if time_match:
                    hours = int(time_match.group(1))
                    minutes = int(time_match.group(2) or 0)
                    period = time_match.group(3).lower()
                    
                    if period == 'pm' and hours < 12:
                        hours += 12
                    elif period == 'am' and hours == 12:
                        hours = 0
                    
                    time_obj = dt.time(hours, minutes)
                    logger.info(f"Successfully parsed time: {time_obj}")
                else:
                    logger.error(f"Failed to parse time string: {time_str}")
                    return JsonResponse({
                        'status': 'error',
                        'message': f"Could not parse time string: {time_str}. Expected format: HH:MM am/pm"
                    }, status=400)

                selected_date = data.get('date')
                booking_date = datetime.now().date()
                if selected_date:
                    try:
                        booking_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
                    except ValueError:
                        pass  # fallback to today's date

                # Check for conflicts
                conflict = Booking.objects.filter(
                    floor=floor,
                    room=data['room'],
                    date=booking_date,
                    time_slot=time_obj
                ).exists()

                if conflict:
                    return JsonResponse({
                        'status': 'error',
                        'message': f"Time slot {time_str} for room {data['room']} on {booking_date} is already booked."
                    }, status=409)

                # Create Booking
                booking = Booking.objects.create(
                    floor=floor,
                    room=data['room'],
                    time_slot=time_obj,
                    reason=data['reason'],
                    user=request.user,
                    booked_by=request.user.company_name,
                    date=booking_date,
                )
                print(request.user.company_name)
                # Create aTimeSlot
                aTimeSlot.objects.create(
                    slot=data['time_slot'],  # original AM/PM string
                    room=data['room'],
                    date=booking_date.strftime('%Y-%m-%d'),
                    name=request.user.company_name,
                    email=request.user.email,
                    month=str(booking_date.month).zfill(2),
                    year=str(booking_date.year),
                    reason=data['reason']
                )

            return JsonResponse({
                'status': 'success',
                'booked_by': bookings_data[-1]['reason']
            })

        except Floor.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Floor not found'
            }, status=404)

        except Exception as e:
            logger.exception("Unexpected error occurred while saving bookings.")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    }, status=405)

#Approve booking
# def approve_booking(request, booking_id):
#     booking = get_object_or_404(Booking, id=booking_id)

#     # Ensure the user is an admin or authorized to approve
#     if not request.user.is_staff:
#         return JsonResponse({
#             'status': 'error',
#             'message': 'You are not authorized to approve this booking'
#         }, status=403)

#     # Update the booking status to approved
#     booking.status = 'approved'
#     booking.save()

#     # ✅ Send an approval notification email to the user
#     if booking.email:  # Make sure email exists
#         send_mail(
#             subject='✅ Your Booking Was Approved',
#             message=f"Hi {booking.booked_by},\n\nYour booking for:\n\n"
#                     f"📍 Floor: {booking.floor.name}\n"
#                     f"🏠 Room: {booking.room}\n"
#                     f"🗓 Date: {booking.date}\n"
#                     f"⏰ Time: {booking.time_slot}\n\n"
#                     f"has been approved. 🎉\n\nThank you!",
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[booking.email],
#             fail_silently=True  # You can set to False for debugging
#         )
#         # ✅ success message here
#     messages.success(request, "Booking approved successfully! 😇")

#     return redirect('booking')  # Make sure to use 'booking:booking' if you use app_name = 'booking'


# Reject booking
# def reject_booking(request, booking_id):
#     booking = get_object_or_404(Booking, id=booking_id)

#     # Ensure the user is an admin or autho ized to reject
#     if not request.user.is_staff:
#         return JsonResponse({
#             'status': 'error',
#             'message': 'You are not authorized to reject this booking'
#         }, status=403)

#     # Update the booking status to rejected
#     booking.status = 'rejected'
#     booking.save()

#     # ❌ Send a rejection notification email to the user
#     if booking.email:
#         send_mail(
#             subject='❌ Your Booking Was Rejected',
#             message=f"Hi {booking.booked_by},\n\nWe regret to inform you that your booking for:\n\n"
#                     f"📍 Floor: {booking.floor.name}\n"
#                     f"🏠 Room: {booking.room}\n"
#                     f"🗓 Date: {booking.date}\n"
#                     f"⏰ Time: {booking.time_slot}\n\n"
#                     f"has been rejected.\n\nFeel free to try booking another slot.\n\nThanks!",
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[booking.email],
#             fail_silently=True
#             )
#         messages.error(request, "Booking rejected.")
        
#     return redirect('booking')  # Redirect to the main booking page or wherever you'd like


@login_required
def delete_slots(request):
    if request.method == 'POST':
        try:
            slots_data = json.loads(request.body)
            deleted_count = 0
            
            for slot in slots_data:
                floor = get_object_or_404(Floor, slug=slot['floor'])
                bookings = Booking.objects.filter(
                    floor=floor,
                    room=slot['room'],
                    time_slot=datetime.strptime(slot['time'], '%I:%M %p').time(),
                    date=slot['date']
                )
                
                if bookings.exists():
                    bookings.delete()
                    deleted_count += 1

            return JsonResponse({
                'status': 'success',
                'message': f'Successfully deleted {deleted_count} slots'
            })

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)

def debug_bookings(request):
    """A debug view to show all bookings in the database."""
    from django.http import HttpResponse
    import json
    
    # Get all bookings
    bookings = Booking.objects.all().order_by('date', 'time_slot')
    
    # Format the bookings as text
    output = []
    output.append("<h1>All Bookings</h1>")
    output.append("<table border='1'>")
    output.append("<tr><th>Date</th><th>Floor</th><th>Room</th><th>Time</th><th>Reason</th><th>Booked By</th></tr>")
    
    for booking in bookings:
        time_key = booking.time_slot.strftime('%I:%M %p').lower()
        if time_key.startswith('0'):
            time_key = time_key[1:]
            
        output.append(f"<tr>")
        output.append(f"<td>{booking.date}</td>")
        output.append(f"<td>{booking.floor.name}</td>")
        output.append(f"<td>{booking.room}</td>")
        output.append(f"<td>{time_key}</td>")
        output.append(f"<td>{booking.reason}</td>")
        output.append(f"<td>{booking.booked_by}</td>")
        output.append(f"</tr>")
    
    output.append("</table>")
    
    # Add some JavaScript to help with debugging
    output.append("<script>")
    output.append("console.log('Debug view loaded');")
    output.append("</script>")
    
    return HttpResponse("\n".join(output))


@csrf_exempt
@login_required
def book_room(request):
    """Handle room booking requests, with approval if needed."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'})
    
    try:
        data = json.loads(request.body)
        room = data.get('room')
        time_str = data.get('time_slot')
        floor_slug = data.get('floor')
        date_str = data.get('date')
        reason = data.get('reason', '')
        
        # Get floor
        floor = get_object_or_404(Floor, slug=floor_slug)
        
        # Parse date
        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Invalid date format'})
        
        # Parse time
        time_match = re.match(r'(\d+)[:\.]?(\d*)\s*(am|pm)', time_str.lower())
        if not time_match:
            return JsonResponse({'success': False, 'error': 'Invalid time format'})
        
        hours = int(time_match.group(1))
        minutes = int(time_match.group(2) or 0)
        period = time_match.group(3).lower()
        
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
            date=booking_date,
            time_slot=time_obj
        ).exists():
            return JsonResponse({'success': False, 'error': 'This slot is already booked'})
        
        # Determine if this booking requires approval
        requires_approval = floor.booking_type.lower() == 'requires approval'
        
        # Create booking
        booking = Booking.objects.create(
            floor=floor,
            room=room,
            time_slot=time_obj,
            date=booking_date,
            reason=reason,
            user=request.user,
            booked_by=request.user.company_name if hasattr(request.user, 'company_name') else request.user.username,
            status='pending' if requires_approval else 'confirmed',
            approval_token=str(uuid.uuid4()) if requires_approval else None
        )
        
        # If approval is required, send email to admin
        if requires_approval:
            # Generate approval links
            approve_url = request.build_absolute_uri(
                reverse('booking:approve_booking', args=[booking.approval_token])
            )
            reject_url = request.build_absolute_uri(
                reverse('booking:reject_booking', args=[booking.approval_token])
            )
            
            # Send email to admin
            send_mail(
                subject=f'Booking Approval Required: {room} at {time_str}',
                message=f"""A new booking requires your approval:
                
User: {request.user.get_full_name() or request.user.username}
Company: {request.user.company_name if hasattr(request.user, 'company_name') else 'N/A'}
Room: {room}
Date: {booking_date}
Time: {time_str}
Reason: {reason}

Approve: {approve_url}
Reject: {reject_url}
""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.BOOKING_ADMIN_EMAIL],
                fail_silently=False,
            )
            
            return JsonResponse({
                'success': True, 
                'message': 'Your booking request has been submitted for approval. You will be notified when it is approved.'
            })
        else:
            return JsonResponse({
                'success': True, 
                'message': 'Booking confirmed successfully!'
            })
            
    except Exception as e:
        logger.error(f"Error in book_room: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)})






