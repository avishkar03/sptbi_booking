# admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.forms import inlineformset_factory
from .models import *
from django_summernote.widgets import SummernoteWidget

User = get_user_model()


class IncubateeAdmin(admin.ModelAdmin):
    model = Incubatee
    ordering = ['company_name']

class SHAdmin(admin.ModelAdmin):
    list_display = ('programmeyear', 'title')
    list_filter = ('programmeyear',)

class SummerNoteAdmin(admin.ModelAdmin): 

     formfield_overrides = { 
            models.TextField: {'widget': SummernoteWidget}, 
     } 

admin.site.register(User, IncubateeAdmin)
admin.site.register(Features, SummerNoteAdmin)
admin.site.register(Team, SummerNoteAdmin)
admin.site.register(VisionMission, SummerNoteAdmin)
admin.site.register(Partner, SummerNoteAdmin)
admin.site.register(Partner_type, SummerNoteAdmin)
admin.site.register(Stat, SummerNoteAdmin)
admin.site.register(News, SummerNoteAdmin)
admin.site.register(Testimonial, SummerNoteAdmin)
admin.site.register(Mentor, SummerNoteAdmin)
admin.site.register(Mentor_type, SummerNoteAdmin)
admin.site.register(Facility, SummerNoteAdmin)
admin.site.register(Project, SHAdmin)
admin.site.register(Programme , SummerNoteAdmin)
admin.site.register(ProgrammeYear , SummerNoteAdmin)
admin.site.register(Banner, SummerNoteAdmin)
admin.site.register(Count, SummerNoteAdmin)
admin.site.register(Image, SummerNoteAdmin)
admin.site.register(InfraFacility, SummerNoteAdmin)
admin.site.register(IotDevice, SummerNoteAdmin)
admin.site.register(Iot, SummerNoteAdmin)
admin.site.register(Sponsor, SummerNoteAdmin)
admin.site.register(Event, SummerNoteAdmin)
admin.site.register(About, SummerNoteAdmin)
