"""website URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.views.static import serve
from django.contrib import admin
from django.urls import include, path, re_path

handler404 = "mainsite.views.my_custom_error_view"
handler500 = "mainsite.views.my_custom_error_view"
handler403 = "mainsite.views.my_custom_error_view"
handler400 = "mainsite.views.my_custom_error_view"

admin.site.site_header = "SP-TBI Admin"
admin.site.index_title = "SP-TBI Admin Panel"
admin.site.site_title = "administration"

urlpatterns = [
    re_path(r'^media/(?P<path>.*)$', serve,
        {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve,
        {'document_root': settings.STATIC_ROOT}),
    path('admin/', admin.site.urls),
    path('', include('mainsite.urls')),
    path('tickets/', include('tickets.urls')),
    path('booking/', include('booking.urls', namespace='booking')),
]
