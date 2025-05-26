from django import forms
from .models import Ticket

class TicketForm(forms.ModelForm):
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'status', 'priority']

class TicketManageForm(forms.ModelForm):
    admin_comments = forms.CharField(
        widget=forms.Textarea(attrs={
            'rows': 4,
            'class': 'form-input',
            'placeholder': 'Add comments about this ticket'
        }),
        required=False
    )

    class Meta:
        model = Ticket
        fields = ['status', 'admin_comments']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-input'}),
        }
