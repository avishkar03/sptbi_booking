from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('incubation/', incubation, name='incubation'),
    path('virtualincubation/', virtualincubation, name='virtualincubation'),
    path('team/', team, name='team'),
    path('facilities/', facilities, name='facilities'),
    path('login/', loginuser, name='login'),
    path('mentors/', mentors, name='mentors'),
    path('logout/', logoutuser, name='logout'),
    path('currentincubatee/', currentincubatee, name='currentincubatee'),
    path('graduatedincubatee/', graduatedincubatee, name='graduatedincubatee'),
    path('programme/<slug:page_slug>/', pgtemplate, name='programme'),
    path('cabinspace/', cabinspace, name='cabinspace'),
    path('labs/', labs, name='labs'),
    path('equipments/', iot, name='equipments'),
    path('events/<slug:page_slug>', events, name='events'),
    path('download/<str:path>', download, name='download'),
    path('downloaddevice/<str:path>', downloaddevice, name='downloaddevice'),
    path('downloadproject/<str:path>', downloadproject, name='downloadproject'),
]
