from django.urls import path
from .views import *
urlpatterns = [
    path('', RenderPost.as_view())
]
