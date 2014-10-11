from django.conf.urls import patterns, include, url
from django.contrib import admin, auth

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'game.views.index', name='index'),
    url(r'^logout/$', 'game.views.logout_view', name='logout'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
