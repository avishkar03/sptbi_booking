from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from . import views

app_name = 'booking'

urlpatterns = [
    path('', views.booking, name='booking'),
    path('floor/<slug:floor_slug>/', views.floor_booking, name='floor_booking'),
    path('profile/', views.profile, name='profile'),
    path('delete/', views.delete, name='delete_booking'),
    path('save_cell_content/', views.save_cell_content, name='save_cell_content'),
    path('download_excel/', views.download_table_as_excel, name='download_excel'),
    path('edit_user/', views.edit_user, name='edit_user'),
    path('change_password/', views.change_password, name='change_password'),
    path('success/', views.success, name='success'),
    path('download_log/', views.download_log, name='download_log'),
    path('download_log2/', views.download_log_2, name='download_log2'),
    path('user_log', views.download_log_user, name="user_download_log"),
    path('add_column/', views.add_column, name='add_column'),
    path('delete_columns/', views.delete_columns, name='delete_columns'),
    path('save_columns/', views.save_columns, name='save_columns'),
    path('save_booking/', views.save_booking, name='save_booking'),
    path('delete_slots/', views.delete_slots, name='delete_slots'),
    # Debug routes
    path('debug/bookings/', views.debug_bookings, name='debug_bookings'),
]
