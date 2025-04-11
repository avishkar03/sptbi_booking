from django import template
from datetime import datetime, time
import logging

register = template.Library()
logger = logging.getLogger(__name__)

@register.filter
def get_item(dictionary, key):
    """Get an item from a dictionary using bracket notation."""
    return dictionary.get(key)

@register.filter
def format_time_key(time_obj):
    """Format a time object in the exact format used for booking keys."""
    if not time_obj:
        return ""
    
    # Format: "h:MM am/pm" - lowercase, without leading zeros for hours
    if isinstance(time_obj, time):
        # Format time as "h:MM am/pm" - e.g. "9:00 am"
        hours = time_obj.hour
        is_pm = hours >= 12
        
        # Convert to 12-hour format
        if hours > 12:
            hours -= 12
        elif hours == 0:
            hours = 12
            
        # Format with leading zero for minutes but not for hours
        formatted = f"{hours}:{time_obj.minute:02d} {'pm' if is_pm else 'am'}"
        
        # Debug log the formatted time
        logger.info(f"Formatting time {time_obj} to key: '{formatted}'")
            
        return formatted
    
    logger.warning(f"format_time_key received non-time object: {type(time_obj)}")
    return "" 