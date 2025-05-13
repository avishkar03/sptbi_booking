from django import forms
from django.contrib import admin
from django.utils.formats import date_format
from django.utils import timezone
from .models import Ticket, TicketHistory

class TicketAdminForm(forms.ModelForm):
    admin_comments = forms.CharField(
        label="Admin Comments",
        widget=forms.Textarea(attrs={
            'rows': 4,
            'cols': 80
        }),
        required=False,
        help_text='Add comments about this ticket (only visible to admins and in ticket history)'
    )

    # Override the status field
    status = forms.ChoiceField(
        choices=Ticket.STATUS_CHOICES
    )

    class Meta:
        model = Ticket
        fields = '__all__'

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    form = TicketAdminForm
    list_display = ('title', 'description', 'status', 'priority', 'created_by', 'formatted_updated_date')
    list_filter = ('status', 'priority', 'created_date')
    search_fields = ('title', 'description')
    readonly_fields = ('title', 'description', 'priority', 'created_by', 'formatted_created_date', 'formatted_updated_date')
    ordering = ('-created_date',)
    list_per_page = 20

    def formatted_created_date(self, obj):
        # Convert to the current timezone (Asia/Kolkata)
        local_dt = timezone.localtime(obj.created_date)
        return date_format(local_dt, format='j F Y, g:i A')  # Example: 11 May 2023, 2:38 PM
    formatted_created_date.short_description = 'Updated Date (IST)'

    def formatted_updated_date(self, obj):
        # Convert to the current timezone (Asia/Kolkata)
        local_dt = timezone.localtime(obj.updated_date)
        return date_format(local_dt, format='j F Y, g:i A')  # Example: 11 May 2023, 2:38 PM
    formatted_updated_date.short_description = 'Updated Date (IST)'

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'priority', 'created_by'),
        }),
        (None, {
            'fields': ('status', 'admin_comments'),
        }),
        (None, {
            'fields': ('formatted_updated_date', 'formatted_created_date'),
            'classes': ('collapse',),
        }),
    )



    def save_model(self, request, obj, form, change):
        if change:  # Only for existing objects
            # Get the original object from the database
            original_obj = Ticket.objects.get(pk=obj.pk)

            # Check if status or admin_comments have changed
            status_changed = obj.status != original_obj.status
            admin_comments = form.cleaned_data.get('admin_comments', '')

            # Only update the status field, preserve all other fields
            obj.title = original_obj.title
            obj.description = original_obj.description
            obj.priority = original_obj.priority
            obj.created_by = original_obj.created_by

            # Update the updated_date only if status changed or admin added comments
            if status_changed or admin_comments:
                obj.updated_date = timezone.now()
            else:
                # Keep the original updated_date if no relevant changes
                obj.updated_date = original_obj.updated_date

            # Save the ticket with only status updated
            super().save_model(request, obj, form, change)

            # Create a new history entry with the comments
            TicketHistory.objects.create(
                ticket=obj,
                title=obj.title,
                description=obj.description,
                status=obj.status,
                comments=admin_comments
            )
        else:
            # For new objects (should rarely happen in admin)
            super().save_model(request, obj, form, change)

# We're not registering TicketHistory with the admin site
# since it's meant to be an internal record and is displayed
# through custom views in the application