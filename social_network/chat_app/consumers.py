from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from .models import *
from django.utils.timezone import localtime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope.get("url_route").get("kwargs").get("chat_id")
        self.room_group_name = f"chat_{self.chat_id}"
        has_access = await self.user_has_access()
        
        if has_access:
            await self.channel_layer.group_add(
                self.room_group_name, 
                self.channel_name
            )
            await self.accept()
        else:
            await self.close(code=4003)
            
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name, 
                self.channel_name
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get("msg")
        if text and text.strip(): 
            message = await self.save_message(text)
            await self.channel_layer.group_send(
                self.room_group_name, 
                {
                    "type": "send_message",
                    "message": message,
                }
            )
            
    @database_sync_to_async
    def user_has_access(self):
        user = self.scope.get("user")
        if user and user.is_authenticated:
            chat = Chat.objects.filter(id = self.chat_id, users = user)
            return chat.exists()
        return False
    
    @database_sync_to_async
    def save_message(self, text):
        user = self.scope.get("user")
        new_message = Message.objects.create(text=text, chat_id=self.chat_id, sender=user)
        return {
            'sender_pseudonym': getattr(new_message.sender, 'pseudonym', new_message.sender.username),
            'sender_id' :  new_message.sender.id,
            'text': new_message.text,
            'datetime': localtime(new_message.created_at).isoformat(),
            'message_id': self.chat_id,
        }
            
    # @database_sync_to_async
    # def save_message(self, text):
    #     user = self.scope.get("user")

    #     new_message = Message.objects.create(
    #         text=text,
    #         chat_id=self.chat_id,
    #         sender=user
    #     )

    #     sender_name = new_message.sender.pseudonym or new_message.sender.username

    #     return {
    #         'sender': sender_name,
    #         'text': new_message.text,
    #         'datetime': localtime(new_message.created_at).isoformat(),
    #         'current_user': sender_name,
    #     }

    async def send_message(self, data):
        await self.send(text_data=json.dumps(data))
