from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # Використовуємо re_path замість path
    re_path(r"^chat/(?P<chat_id>\d+)/?$", ChatConsumer.as_asgi(), name="chat_ws"),
]