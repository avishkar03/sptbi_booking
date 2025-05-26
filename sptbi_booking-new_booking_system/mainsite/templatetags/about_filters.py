from django import template
from django.utils.safestring import mark_safe
import re

register = template.Library()

@register.filter
def highlight_keywords(text, keywords_string):
    """
    Replaces keywords in text with highlighted spans.
    Keywords are provided as a comma-separated string.
    """
    if not text or not keywords_string:
        return text

    keywords = [k.strip() for k in keywords_string.split(',') if k.strip()]
    if not keywords:
        return text

    # Create a regex pattern to find keywords (less strict with boundaries)
    # Sort keywords by length descending to match longer phrases first
    keywords.sort(key=len, reverse=True)
    # Escape special regex characters in keywords and create individual patterns
    keyword_patterns = [re.escape(k) for k in keywords]
    # Join individual keyword patterns with | for OR matching
    pattern = r'(' + '|'.join(keyword_patterns) + r')'

    def replace_match(match):
        # Replace the matched keyword with the highlighted span
        return f'<span class="highlight">{match.group(0)}</span>'

    # Perform the replacement using regex
    highlighted_text = re.sub(pattern, replace_match, text, flags=re.IGNORECASE)

    return mark_safe(highlighted_text) 