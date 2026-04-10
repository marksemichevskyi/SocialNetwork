from django.urls import path
from .views import *
urlpatterns = [
    path('', RenderUser.as_view())
]
