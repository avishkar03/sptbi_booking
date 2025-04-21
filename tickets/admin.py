from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'status', 'priority', 'created_date', 'updated_date')
    list_filter = ('status', 'priority', 'created_date')
    search_fields = ('title', 'description')
    readonly_fields = ('created_date', 'updated_date')
    ordering = ('-created_date',)
    list_per_page = 20