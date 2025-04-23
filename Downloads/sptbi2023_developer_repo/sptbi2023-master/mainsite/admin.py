# admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.forms import inlineformset_factory
from .models import *
User = get_user_model()


class IncubateeAdmin(admin.ModelAdmin):
    model = Incubatee
    ordering = ['company_name']

class SHAdmin(admin.ModelAdmin):
    list_display = ('programmeyear', 'title')
    list_filter = ('programmeyear',)

admin.site.register(User, IncubateeAdmin)
admin.site.register(Features)
admin.site.register(Team)
admin.site.register(VisionMission)
admin.site.register(Partner)
admin.site.register(Partner_type)
admin.site.register(Stat)
admin.site.register(News)
admin.site.register(Testimonial)
admin.site.register(Mentor)
admin.site.register(Mentor_type)
admin.site.register(Facility)
admin.site.register(Project, SHAdmin)
admin.site.register(Programme)
admin.site.register(ProgrammeYear)
admin.site.register(Banner)
admin.site.register(Count)
admin.site.register(Image)
admin.site.register(InfraFacility)
admin.site.register(IotDevice)
admin.site.register(Iot)
admin.site.register(Sponsor)
admin.site.register(Event)
admin.site.register(About)
