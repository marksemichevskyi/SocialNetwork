from django.urls import path 
from .consumers import *

websockets_urlpatterns = [
    path("chat/<int:chat_id>/", ChatConsumer.as_asgi(), name="chat_ws")
]