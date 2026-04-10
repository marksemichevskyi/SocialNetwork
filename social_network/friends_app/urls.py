from django.urls import path
from .views import *
urlpatterns = [
    path('', RenderFriends.as_view())
]