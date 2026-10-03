from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'),
    path('reports/', views.reports, name='reports'),
    path('offers/', views.offers, name='offers'),
]