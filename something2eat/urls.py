from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login', views.login_view, name='login'),
    path('', views.logout_view, name='logout'),
    path('register', views.register_view, name='register'),
]
