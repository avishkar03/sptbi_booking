from django.views.generic.edit import CreateView, UpdateView
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Ticket, TicketHistory
from .forms import TicketForm, TicketManageForm

class TicketCreateView(LoginRequiredMixin, CreateView):
    model = Ticket
    form_class = TicketForm
    template_name = 'tickets/ticket_form.html'
    success_url = reverse_lazy('tickets:ticket_success')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        context['user_full_name'] = user.company_name
        return context

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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add current timezone info to context
        context['current_timezone'] = timezone.get_current_timezone_name()
        return context


class TicketManageView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Ticket
    template_name = 'tickets/manage_ticket.html'
    form_class = TicketManageForm
    success_url = reverse_lazy('tickets:ticket_manage_list')

    def test_func(self):
        return self.request.user.is_staff
    
    def form_valid(self, form):
        response = super().form_valid(form)
        # Create history entry for the changes
        ticket = self.object
        TicketHistory.objects.create(
            ticket=ticket,
            title=ticket.title,
            description=ticket.description,
            status=ticket.status,
            comments=form.cleaned_data.get('admin_comments', '')
        )
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True})
        return response


class TicketManageListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Ticket
    template_name = 'tickets/manage_list.html'
    context_object_name = 'tickets'
    ordering = ['-created_date']

    def test_func(self):
        return self.request.user.is_staff
