from django.contrib import admin
from .models import aTimeSlot, Booking, Floor
# Register your models here.


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    ordering = ['order', 'name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(aTimeSlot)
class aTimeSlotAdmin(admin.ModelAdmin):
    list_display = ('slot', 'room', 'date', 'name', 'email')
    search_fields = ('name', 'email', 'date')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['floor', 'room', 'date', 'time_slot', 'booked_by']
    list_filter = ['floor', 'date']
    search_fields = ['room', 'booked_by']
    ordering = ['-date', 'time_slot']
