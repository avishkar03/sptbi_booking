from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from .models import Ticket
from .forms import TicketForm

class TicketCreateView(CreateView):
    model = Ticket
    form_class = TicketForm
    template_name = 'tickets/ticket_form.html'
    success_url = reverse_lazy('ticket_success')
