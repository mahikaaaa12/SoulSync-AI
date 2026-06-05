from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('dashboard/', views.index, name='index'),
    path('api/customers/', views.api_customers, name='api_customers'),
]