from django.views.generic import TemplateView
from django.urls import path
from .views import TicketCreateView

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='ticket_create'),
    path('success/', TemplateView.as_view(template_name='tickets/success.html'), name='ticket_success'),
]