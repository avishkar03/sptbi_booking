from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from .views import *
from . import views

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
    path('booking/', booking, name='booking'),
    path('floor1/', floor1, name='floor1'),
    path('floor2/', floor2, name='floor2'),
    path('floor8/', floor8, name='floor8'),
    path('add_booking/', views.add_booking, name='add_booking'),
    path('profile/', views.profile, name='profile'),
    path('delete/', views.delete_booking, name='delete'),
    path('save_cell_content/', views.save_cell_content, name='save_cell_content'),
]
