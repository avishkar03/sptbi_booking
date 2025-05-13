from .models import Floor

def floors(request):
    """Make active floors available to all templates."""
    return {
        'floors': Floor.objects.filter(is_active=True).exclude(name__in=['Restricted Floor', 'Unrestricted Floor']).order_by('order')
    }