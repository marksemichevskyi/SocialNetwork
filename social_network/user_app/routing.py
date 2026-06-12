from django.urls import path 
from .consumers import *

user_websockets_urlpatterns = [
    path("presence/", PresenceConsumer.as_asgi(), name="presence")
]