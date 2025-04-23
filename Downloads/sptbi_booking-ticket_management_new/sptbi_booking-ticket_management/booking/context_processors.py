from .models import Floor

def floors(request):
    """Make active floors available to all templates."""
    return {
        'floors': Floor.objects.filter(is_active=True).order_by('order')
    } 