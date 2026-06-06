from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('dashboard/', views.index, name='index'),
    path('api/customers/', views.api_customers, name='api_customers'),
    path('api/meetings/', views.api_meetings, name='api_meetings'),
    path('api/customers/<str:customer_id>/matches/', views.api_customer_matches, name='api_customer_matches'),
]
