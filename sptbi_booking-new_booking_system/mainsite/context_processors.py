from .models import Count

def visitor_counter(request):
    """
    Make visitor counter available to all templates.
    Provides visit_counter, visit_add, and count variables.
    """
    try:
        visit_counter = Count.objects.get(name="Actual")
    except Count.DoesNotExist:
        visit_counter = Count(name="Actual", count=0)
        visit_counter.save()

    try:
        visit_add = Count.objects.get(name="Extra")
    except Count.DoesNotExist:
        visit_add = Count(name="Extra", count=0)
        visit_add.save()
    
    # Only increment the counter on the index page to avoid multiple counts
    if request.path == '/':
        visit_counter.count += 1
        visit_counter.save()
    
    count_list = str(visit_counter.count + visit_add.count)
    count = list(count_list)
    
    return {
        'visit_counter': visit_counter,
        'visit_add': visit_add,
        'count': count
    }
