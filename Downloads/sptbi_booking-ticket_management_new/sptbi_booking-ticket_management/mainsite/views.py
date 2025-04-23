from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from .models import *
from django.contrib.auth import login, logout, get_user_model
from django.http import FileResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
from datetime import datetime, timedelta
import json

User = get_user_model()

# Create your views here.
def index(request):
    about = About.objects.all()
    visit_counter = Count.objects.get(name = "Actual")
    visit_add = Count.objects.get(name = "Extra")
    visit_counter.count += 1
    visit_counter.save()
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    banners = Banner.objects.all()
    objs = Features.objects.all()
    vm = VisionMission.objects.all()
    Partner_types = Partner_type.objects.all()
    stats = Stat.objects.all()
    news = News.objects.all()
    testimonial = Testimonial.objects.all()
    if request.method == 'POST':
        segment_index = request.POST.get('segmentIndex')
        # Implement your logic to decide the URL to redirect to based on segment_index
        # For example, you can use a dictionary or a list to map segment_index to URLs.

        # Redirect to the desired URL
        # Replace 'desired_url' with the URL you want to redirect to
        # return JsonResponse({'redirect_url': 'desired_url'})
    return render(request, 'index.html', {'about': about, 'objs': objs, 'vm': vm, 'Partner_types': Partner_types, 'stats': stats, 'news': news, 'testimonial': testimonial, 'pg': pg, 'banners': banners, 'count': count, 'events': events})

def incubation(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    return render(request,'incubation.html', {'pg': pg, 'count': count, 'events' : events})

def currentincubatee(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    choices = [
        'Aerospace',
        'SAAS',
        'Agri Tech',
        'Bio Tech',
        'Chemistry',
        'Clean Tech',
        'Construction',
        'Defence',
        'Nano Tech',
        'Food Tech',
        'Healthcare',
        'AR-VR',
        'ICT',
        'Manufacturing',
        'Edu Tech',
        'Energy',
        'Automobile',
        'Others',
    ]
    choices = sorted(choices)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    if request.method=='POST':
        option = request.POST.get('selected')
        print(option)
        if option == 'all':
            objects_list = User.objects.filter(
                is_superuser=False, current_status='Current')
        else:
            objects_list = User.objects.filter(
                is_superuser=False, current_status='Current', startup_sector=option)
    # Number of objects to show per page
        per_page = 10

        paginator = Paginator(objects_list, per_page)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        objs = page_obj.object_list
        return render(request, 'currentincubatee.html', {'page_obj': page_obj, 'paginator': paginator, 'objs': objs, 'pg': pg, 'count': count, 'choices': choices, 'events' : events})

    objects_list = User.objects.filter(is_superuser=False, current_status='Current')
    # Number of objects to show per page
    per_page = 10

    paginator = Paginator(objects_list, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    objs = page_obj.object_list
    return render(request,'currentincubatee.html', {'page_obj': page_obj, 'paginator': paginator, 'objs': objs, 'pg': pg, 'count': count, 'choices': choices, 'events' : events})


def graduatedincubatee(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    choices = [
        'Aerospace',
        'SAAS',
        'Agri Tech',
        'Bio Tech',
        'Chemistry',
        'Clean Tech',
        'Construction',
        'Defence',
        'Nano Tech',
        'Food Tech',
        'Healthcare',
        'AR-VR',
        'ICT',
        'Manufacturing',
        'Edu Tech',
        'Energy',
        'Automobile',
        'Others',
    ]
    choices = sorted(choices)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    if request.method == 'POST':
        option = request.POST.get('selected')
        print(option)
        if option == 'all':
            objects_list = User.objects.filter(
                is_superuser=False, current_status='Graduated')
        else:
            objects_list = User.objects.filter(
                is_superuser=False, current_status='Graduated', startup_sector=option)
    # Number of objects to show per page
        per_page = 10

        paginator = Paginator(objects_list, per_page)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        objs = page_obj.object_list
        return render(request, 'graduatedincubatee.html', {'page_obj': page_obj, 'paginator': paginator, 'objs': objs, 'pg': pg, 'count': count, 'choices': choices, 'events' : events})
    objects_list = User.objects.filter(
        is_superuser=False, current_status='Graduated')
    # Number of objects to show per page
    per_page = 10

    paginator = Paginator(objects_list, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    objs = page_obj.object_list
    return render(request, 'graduatedincubatee.html', {'page_obj': page_obj, 'paginator': paginator, 'objs': objs, 'pg': pg, 'count': count, 'choices': choices, 'events' : events})

def pgtemplate(request, page_slug):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    try:
        page_template = Programme.objects.get(slug=page_slug)
        objectives_list = page_template.objectives.split('\n') if page_template.objectives else []
        for i in range(len(objectives_list)):
            objectives_list[i] = objectives_list[i].split('~')
        eligibility_list = page_template.eligible.split('\n') if page_template.eligible else []
        for i in range(len(eligibility_list)):
            eligibility_list[i] = eligibility_list[i].split('~')
        noteligible_list = page_template.noteligible.split('\n') if page_template.noteligible else []
        for i in range(len(noteligible_list)):
            noteligible_list[i] = noteligible_list[i].split('~')
        broadcovered_list = page_template.broadcovered.split('\n') if page_template.broadcovered else []
        for i in range(len(broadcovered_list)):
            broadcovered_list[i] = broadcovered_list[i].split('~')
        broadnotcovered_list = page_template.broadnotcovered.split('\n') if page_template.broadnotcovered else []
        for i in range(len(broadnotcovered_list)):
            broadnotcovered_list[i] = broadnotcovered_list[i].split('~')
        guidelines = page_template.guidelines.split('\n') if page_template.guidelines else []
        for i in range(len(guidelines)):
            guidelines[i] = guidelines[i].split('~')
        benefits = page_template.benefits.split('\n') if page_template.benefits else []
        for i in range(len(benefits)):
            benefits[i] = benefits[i].split('~')
        years = ProgrammeYear.objects.filter(programme=page_template)
        years = sorted(years, key=lambda x: x.yearNo)
        projects = []
        for year in years:
            year.slug = str(year.yearNo) + '~' + year.programme.slug
            year.save()
            projects.append(Project.objects.filter(programmeyear=year).order_by('orderno'))
        print(years)
    except Programme.DoesNotExist:
        # Handle the case when the requested page doesn't exist
        page_template = None
        objectives_list = []
        eligibility_list = []
        noteligible_list = []
        broadcovered_list = []
        broadnotcovered_list = []
        guidelines = []
        benefits = []
        years = []
        projects=[]
    return render(request, 'pgtemp.html', {'projects':projects, 'page_template': page_template, 'pg': pg, 'objectives_list': objectives_list, 'eligibility_list': eligibility_list, 'noteligible_list': noteligible_list, 'broadcovered_list': broadcovered_list, 'broadnotcovered_list': broadnotcovered_list, 'guidelines': guidelines, 'benefits': benefits, 'count': count, 'years': years, 'events' : events})

def events(request, page_slug):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    try:
        page_template = Event.objects.get(slug=page_slug)
        if page_template.timeline:
            timeline_list = page_template.timeline.split(
                '\n') if page_template.timeline else []
            timeline =[i.split(":") for i in timeline_list]
        else:
            timeline = [] 
        takeaways = page_template.takeaways.split(
            '\n') if page_template.takeaways else []
        targetgrp = page_template.targetgrp.split(
            '\n') if page_template.targetgrp else []
        conditions = page_template.sponsors.exists()
        print(page_template.prizeother)
        if page_template.prizeother:
            other_list = page_template.prizeother.split(
                '\n') if page_template.timeline else []
            others = [i.split(":") for i in other_list]
        else:
            others = []
    except Programme.DoesNotExist:
        # Handle the case when the requested page doesn't exist
        page_template = None
        timeline = []
        takeaways = []
        targetgrp = []
        others = []
        conditions = False
    return render(request, 'events.html', {'page_template': page_template, 'pg': pg, 'timeline': timeline, 'takeaways': takeaways, 'targetgrp': targetgrp, 'count': count, 'events' : events, 'conditions': conditions, 'others': others})

def virtualincubation(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    return render(request,'virtualincubation.html', {'pg': pg, 'count': count, 'events' : events})

def team(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    team = Team.objects.all().order_by("orderno")
    return render(request,'team.html',{'team':team, 'pg': pg, 'count': count, 'events' : events})

def facilities(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    infraFacility = InfraFacility.objects.all()
    return render(request,'meetingroom.html', {'pg': pg, 'count': count, 'infraFacility': infraFacility, 'events' : events})

def my_custom_error_view(request, exception=None):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    return render(request,'404.html', {'pg': pg, 'count': count, 'events' : events})

def mentors(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    mentor_type = Mentor_type.objects.all()
    return render(request,'mentors.html', {'mentor_type': mentor_type, 'pg': pg, 'count': count, 'events' : events})

def cabinspace(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    return render(request,'cabinspace.html', {'pg': pg, 'count': count, 'events' : events})

def iot(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    types = Iot.objects.all()
    choices = []
    devices = IotDevice.objects.all()
    for i in types:
        choices.append(i)
    specs = []
    temp=  []
    for i in devices:
        temp = i.spec.split("\n")
        others = [j.split(":") for j in temp]
        specs.append(others)
    # print(specs)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)

    if request.method == 'POST':
        option = request.POST.get("selected")
        if option != 'all':
            types = Iot.objects.filter(name=option)
        else:
            types = Iot.objects.all()

    return render(request,'iot.html', {'pg': pg,'types':types, 'count': count, 'devices': devices, 'events' : events, 'specs': specs, 'choices':choices})    

def labs(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    return render(request,'labs.html', {'pg': pg, 'count': count, 'events' : events})

def loginuser(request):
    events = Event.objects.all()
    events = sorted(events, key=lambda x: x.orderno)
    visit_counter = Count.objects.get(name="Actual")
    visit_add = Count.objects.get(name="Extra")
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    pg = Programme.objects.all()
    pg = sorted(pg, key=lambda x: x.orderno)
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(email, password)
        try:
            user = User.objects.get(email=email)
            print(user)
            print(user.password)
            if user.password == password:
                login(request,user)
                return redirect('booking')
            else:
                return render(request,'login.html',{'error':'Invalid Credentials', 'pg': pg, 'count': count, 'events': events})
        except:
            return render(request,'login.html',{'error':'Invalid Credentials', 'pg': pg, 'count': count, 'events': events})
    return render(request,'login.html', {'pg': pg, 'count': count, 'events': events})

def logoutuser(request):
    logout(request)
    next_page = request.GET.get('next', 'booking')
    return redirect(next_page)

def download(request, path):
    py = ProgrammeYear.objects.get(slug = path)
    return FileResponse(open(py.file.path, 'rb'), as_attachment=True, filename=py.file.name)

def downloaddevice(request, path):
    device = IotDevice.objects.get(slug = path)
    response =  FileResponse(open(device.file.path, 'rb'), as_attachment=True, filename=device.file.name)
    response['Content-Disposition'] = 'inline; filename="device.file.name"'
    return response

def downloadproject(request, path):
    project = Project.objects.get(slug = path)
    response =  FileResponse(open(project.file.path, 'rb'), as_attachment=True, filename=project.file.name)
    response['Content-Disposition'] = 'inline; filename="project.file.name"'
    return response

def booking(request):
    return render(request, 'booking.html')

@csrf_exempt
def add_booking(request):
    if request.method == 'POST':
        time_slot = request.POST.get('time_slot')
        room = request.POST.get('room')
        return JsonResponse({'message': 'Booking added successfully!'})
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def delete_booking(request):
    if request.method == 'POST':
        booking_id = request.POST.get('id')
        return JsonResponse({'message': 'Booking deleted successfully!'})
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def save_cell_content(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        time = data.get('time')
        room = data.get('room')
        content = data.get('content')
        return JsonResponse({'message': 'Content saved successfully!'})
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def floor1(request):
    time_slots = []
    start_time = datetime.strptime("9:00 AM", "%I:%M %p")
    end_time = datetime.strptime("8:30 PM", "%I:%M %p")
    while start_time <= end_time:
        time_slots.append(start_time.strftime("%I:%M %p"))
        start_time += timedelta(minutes=30)
    bookings = [
        {"id": 1, "time_slot": "9:00 AM", "room": "Meeting Room 1"},
        {"id": 2, "time_slot": "10:00 AM", "room": "Meeting Room 1"},
        {"id": 3, "time_slot": "11:00 AM", "room": "Meeting Room 1"},
    ]
    return render(request, 'floor1.html', {'bookings': bookings, 'time_slots': time_slots})

def floor2(request):
    time_slots = []
    start_time = datetime.strptime("9:00 AM", "%I:%M %p")
    end_time = datetime.strptime("8:30 PM", "%I:%M %p")
    while start_time <= end_time:
        time_slots.append(start_time.strftime("%I:%M %p"))
        start_time += timedelta(minutes=30)
    bookings = [
        {"id": 1, "time_slot": "9:00 AM", "room": "Meeting Room 1 - 2nd Floor"},
        {"id": 2, "time_slot": "10:00 AM", "room": "Meeting Room 1 - 2nd Floor"},
        {"id": 3, "time_slot": "11:00 AM", "room": "Meeting Room 1 - 2nd Floor"},
    ]
    return render(request, 'floor2.html', {'bookings': bookings, 'time_slots': time_slots})

def floor8(request):
    time_slots = []
    start_time = datetime.strptime("9:00 AM", "%I:%M %p")
    end_time = datetime.strptime("8:30 PM", "%I:%M %p")
    while start_time <= end_time:
        time_slots.append(start_time.strftime("%I:%M %p"))
        start_time += timedelta(minutes=30)
    bookings = [
        {"id": 1, "time_slot": "9:00 AM", "room": "Meeting Room 1 - 8th Floor"},
        {"id": 2, "time_slot": "10:00 AM", "room": "Meeting Room 1 - 8th Floor"},
        {"id": 3, "time_slot": "11:00 AM", "room": "Meeting Room 1 - 8th Floor"},
    ]
    return render(request, 'floor8.html', {'bookings': bookings, 'time_slots': time_slots})

def profile(request):
    return render(request, 'profile.html')
