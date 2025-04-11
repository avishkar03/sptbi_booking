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
