from django.urls import path
from .views import *
urlpatterns = [
    path('', MainView.as_view()),
    path('set_username/', UsernameView.as_view(), name = 'set_username')
]