from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        chat_id = self.scope.get("url_route").get("kwargs").get("chat_id")
        self.room_group_name = f"chat_{chat_id}"
        await self.channel_layer.group_add(
            self.room_group_name, 
            self.channel_name
        )
        await self.accept()
        await self.send(json.dumps({
            "status": "connect"
        }))