from django.contrib import admin
from .models import *
# Register your models here.


class SHAdmin(admin.ModelAdmin):
    list_display = ['slot', 'name', 'date']
    
admin.site.register(aTimeSlot, SHAdmin)
