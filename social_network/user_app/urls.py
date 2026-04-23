from django.urls import path
from .views import *
urlpatterns = [
    path('settings/', UserView.as_view()),
    path('auth/', AuthView.as_view()),
]
