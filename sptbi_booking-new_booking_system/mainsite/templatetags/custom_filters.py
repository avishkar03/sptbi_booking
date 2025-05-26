# custom_filters.py

from django import template
import re

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

@register.filter(name='feature_icon')
def feature_icon(title):
    """
    Maps a feature title to an appropriate Bootstrap icon name.
    If no specific mapping exists, returns a default icon.
    """
    # Convert title to lowercase and remove special characters
    title_slug = re.sub(r'[^\w\s]', '', title.lower().strip())

    # Define mappings from common feature words to Bootstrap icons
    # Using more modern and visually appealing Bootstrap icons
    icon_map = {
        # Incubation & Startup related
        'incubation': 'building-fill-check',
        'startup': 'rocket-takeoff-fill',
        'accelerator': 'speedometer2',
        'acceleration': 'speedometer2',

        # Funding & Investment related
        'funding': 'currency-dollar',
        'investment': 'bank2',
        'finance': 'cash-stack',
        'financial': 'cash-coin',

        # Mentorship & Support related
        'mentorship': 'person-fill-check',
        'mentor': 'person-fill-check',
        'internship': 'person-workspace',
        'internships': 'person-workspace',
        'support': 'shield-fill-check',

        # Community & Networking related
        'networking': 'node-plus-fill',
        'network': 'diagram-3-fill',
        'community': 'people-fill',
        'partnership': 'people-fill',
        'collaboration': 'people-fill',

        # Innovation & Research related
        'innovation': 'lightbulb-fill',
        'technology': 'cpu-fill',
        'tech': 'cpu-fill',
        'research': 'search-heart-fill',
        'development': 'gear-fill',

        # Education & Training related
        'training': 'mortarboard-fill',
        'education': 'book-half',
        'workshop': 'tools',
        'learning': 'journal-check',

        # Events & Programs related
        'event': 'calendar-event-fill',
        'program': 'list-check',
        'programme': 'list-check',

        # Business related
        'business': 'briefcase-fill',
        'entrepreneur': 'person-badge-fill',
        'entrepreneurship': 'person-badge-fill',

        # Facilities related
        'coworking': 'building-fill',
        'space': 'building-fill',
        'office': 'building-fill',
        'lab': 'flask-fill',
        'laboratory': 'flask-fill',

        # Product related
        'prototype': 'box2-fill',
        'product': 'box2-heart-fill',

        # Market related
        'market': 'shop-window',
        'marketing': 'megaphone-fill',

        # Growth related
        'growth': 'graph-up-arrow',
        'scale': 'graph-up-arrow',
        'scaling': 'graph-up-arrow',

        # Resources related
        'resource': 'archive-fill',
        'resources': 'archive-fill',
        'facility': 'building-gear',
        'facilities': 'building-gear',
        'equipment': 'tools',
        'infrastructure': 'buildings-fill',

        # Services related
        'service': 'gear-wide-connected',
        'services': 'gear-wide-connected',
    }

    # Check if any word in the title matches our mapping
    for word in title_slug.split():
        if word in icon_map:
            return icon_map[word]

    # Default icon if no match is found
    return 'stars-fill'
