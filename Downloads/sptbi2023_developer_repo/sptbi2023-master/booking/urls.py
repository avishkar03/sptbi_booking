from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from . import views

urlpatterns = [
    path('', views.index, name='booking'),
    path('profile/', views.profile, name='profile'),
    path('delete/', views.delete_slot, name='delete'),
    path('download_excel/', views.download_table_as_excel, name='download_excel'),
    path('edit_user/', views.edit_user, name='edit_user'),
    path('change_password/', views.change_password, name='change_password'),
    path('download_log/', views.download_log, name='download_log'),
    path('testLog', views.download_log_2, name="dateLog"),
    path('user_log', views.download_log_user, name="user_download_log")
]
