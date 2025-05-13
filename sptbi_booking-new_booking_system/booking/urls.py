from django.contrib import admin
from django.urls import path
from django.urls import reverse
from django.urls.conf import include
from . import views
from .restricted_booking_view import restricted_booking_view, approve_booking, reject_booking, check_booking_updates, api_approve_booking, api_reject_booking
# from . import view_restricted
from .views import book_room
from .tests import test_email
from .admin_api import add_column_api, delete_column_api, delete_booking_api

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
    path('debug/bookings/', views.debug_bookings, name='debug_bookings'),       # Debug routes
    # path('approve-booking/<int:booking_id>/', views.approve_booking, name='approve-booking'),       # Debug routes
    # path('reject-booking/<int:booking_id>/', views.reject_booking, name='reject-booking'),
    #Email Functionality
    path('book-room/',book_room, name='book_room'),
    path('restricted-booking/<slug:floor_slug>/',restricted_booking_view, name='restricted_booking'),
    # path('booking/restricted-booking/<slug:floor_slug>/',restricted_booking_view, name='restricted_booking'),
    path('approve/<str:token>/', approve_booking, name='approve_booking'),
    path('reject/<str:token>/', reject_booking, name='reject_booking'),
    path('check-updates/', check_booking_updates, name='check_booking_updates'),
    path('api/approve/<str:token>/', api_approve_booking, name='api_approve_booking'),
    path('api/reject/<str:token>/', api_reject_booking, name='api_reject_booking'),
    path('test-email/', test_email, name='test_email'),

    # Admin API endpoints
    path('api/add-column/', add_column_api, name='add_column_api'),
    path('api/delete-column/', delete_column_api, name='delete_column_api'),
    path('api/delete-booking/', delete_booking_api, name='delete_booking_api'),
]
