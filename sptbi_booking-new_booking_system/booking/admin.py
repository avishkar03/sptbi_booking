from django.contrib import admin
from .models import aTimeSlot, Booking, Floor
# Register your models here.


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_active', 'booking_type']
    list_editable = ['order', 'is_active', 'booking_type']
    ordering = ['order', 'name']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['booking_type']      # Filter by booking type in admin panel

@admin.register(aTimeSlot)
class aTimeSlotAdmin(admin.ModelAdmin):
    list_display = ('slot', 'room', 'date', 'name')
    search_fields = ('name',  'date')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['floor', 'room', 'date', 'time_slot', 'booked_by']
    list_filter = ['floor', 'date']
    search_fields = ['room', 'booked_by']
    ordering = ['-date', 'time_slot']





# class FloorForm(forms.ModelForm):
#     class Meta:
#         model = Floor
#         fields = ['name', 'slug', 'order', 'is_active', 'rooms', 'booking_type']
