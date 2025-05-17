# custom_filters.py

from django import template

register = template.Library()


@register.filter(name='divide')
def divide(value, arg):
    return int(value) / int(arg)

@register.filter(name='even')
def even(value):
    return int(value) % 2 == 0

@register.filter(name='zip_lists')
def zip_lists(list1, list2):
    return zip(list1, list2)

@register.filter(name='get_range')
def get_range(value):
    """
    Filter - returns a list containing range made from given value
    Usage (in template):
    {% for i in total_pages|get_range %}
        <div class="news-carousel-dot {% if forloop.first %}active{% endif %}"></div>
    {% endfor %}
    """
    return range(int(value))
