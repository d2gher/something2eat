from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register_view, name='register'),
    path('ingredients', views.ingredients_view, name='ingredients'),
    path('recipes', views.recipies_view, name='recipes'),
    path('recipes/<int:id>', views.recipie_view, name='recipe'),
]
