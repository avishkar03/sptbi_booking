from django.views.generic.edit import CreateView
from django.views.generic import ListView
from django.urls import reverse_lazy
from django.http import JsonResponse
from .models import Ticket, TicketHistory
from .forms import TicketForm

class TicketCreateView(CreateView):
    model = Ticket
    form_class = TicketForm
    template_name = 'tickets/ticket_form.html'
    success_url = reverse_lazy('tickets:ticket_success')
    
    def form_valid(self, form):
        try:
            form.instance.created_by = self.request.user  # 👈 set created_by before saving
            self.object = form.save()
            # Create ticket history entry
            TicketHistory.objects.create(
                ticket=self.object,
                title=self.object.title,
                description=self.object.description,
                status=self.object.status
            )
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True})
            return super().form_valid(form)
        except Exception as e:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': str(e)}, status=400)
            raise

    def form_invalid(self, form):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        return super().form_invalid(form)


class TicketHistoryView(ListView):
    model = TicketHistory
    template_name = 'tickets/history.html'
    context_object_name = 'ticket_histories'
    ordering = ['-created_date']
