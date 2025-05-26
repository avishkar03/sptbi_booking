from django.views.generic import TemplateView
from django.urls import path
from .views import TicketCreateView, TicketHistoryView, TicketManageView, TicketManageListView

app_name = 'tickets'

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='ticket_create'),
    path('success/', TemplateView.as_view(template_name='tickets/success.html'), name='ticket_success'),
    path('history/', TicketHistoryView.as_view(), name='ticket_history'),
    path('manage/', TicketManageListView.as_view(), name='ticket_manage_list'),
    path('manage/<int:pk>/', TicketManageView.as_view(), name='ticket_manage'),
]