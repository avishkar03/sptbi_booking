import json
from django.http import HttpResponse
from django.shortcuts import redirect, render
from .models import aTimeSlot
from django.contrib.auth import login, logout, get_user_model
from django.contrib.auth.models import User
from datetime import datetime
from django.urls import reverse
from django.core.paginator import Paginator
from django.db.models import F
import xlsxwriter
from mainsite.models import *

# Create your views here.
User = get_user_model()

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
    events = sorted(events, key=lambda x: x.orderno)
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
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


def profile(request):
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
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
    print(month, year)
    timeslots_tm = aTimeSlot.objects.filter(
        email=user.email, month=month, year=year)
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
    return render(request, 'profile.html', {'logs': logs, 'page_obj': page_obj, 'free_hours': free_hours, 'charges': charges, "objs": active_objs, 'total': total, 'pg': pg, 'count': count, 'events': events, 'companies':companies})


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
    return render(request, 'edituser.html', {'x': x, 'us': us, 'pg': pg, 'count': count, 'events': events})


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
        return render(request, 'changepassword.html', {'error': 'Passwords do not match', 'pg': pg, 'count': count, 'events': events})
    return render(request, 'changepassword.html', {'pg': pg, 'count': count, 'events':events})


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
