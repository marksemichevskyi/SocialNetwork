from django.urls import path
from .views import *
urlpatterns = [
    path('', RenderMain.as_view())
]