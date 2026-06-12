from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from .models import Chat, Message  # Краще імпортувати явно, ніж через *

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope.get("url_route").get("kwargs").get("chat_id")
        self.room_group_name = f"chat_{self.chat_id}"
        
        has_access = await self.user_has_access()
        if has_access:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()
            
    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get("msg")
        
        if text and text.strip():
            message = await self.save_message(text)
            current_user_id = self.scope.get("user").id
            
            # Надсилаємо сповіщення в персональні групи ІНШИХ учасників чату
            for member_id in message['members_id']:
                if member_id != current_user_id:
                    await self.channel_layer.group_send(
                        f"user_{member_id}",
                        {
                            'type': 'chat_list_update',  # Унікальний тип для user_app
                            'chat_id': self.chat_id,
                        }
                    )
            
            # Надсилаємо саме повідомлення в кімнату чату
            await self.channel_layer.group_send(
                self.room_group_name, 
                {
                    "type": "chat_message",  # Унікальний тип для поточного чату
                    "message": message,
                }
            )
            
    @database_sync_to_async
    def user_has_access(self):
        user = self.scope.get("user")
        if user and user.is_authenticated:
            return Chat.objects.filter(id=self.chat_id, users=user).exists()
        return False
    

    @database_sync_to_async
    def save_message(self, text):
        user = self.scope.get("user")
        new_message = Message.objects.create(text=text, chat_id=self.chat_id, sender=user)
        members_id = list(new_message.chat.users.values_list('id', flat=True))
        sender_pseudonym = user.profile.pseudonym if hasattr(user, 'profile') else "Користувач"
        # Формуємо структуру ТОЧНО так, як її парсить ваш JS
        return {
            'id': new_message.id,
            'sender_id': user.id,                           
            'sender_pseudonym': sender_pseudonym,           
            'text': new_message.text,
            'datetime': new_message.created_at.isoformat(),    
            'date': str(new_message.created_at.date()),        
            'images': [],                                       
            'members_id': members_id
        }
        
    @database_sync_to_async   
    def read_message(self, message_id):
        user = self.scope.get("user")
        message = Message.objects.filter(id=message_id).first()
        if message and user != message.sender:
            message.readers.add(user)

    # Обробник події "type": "chat_message"
    async def chat_message(self, event):
        # Фіксація прочитання відбувається в момент доставки конкретному юзеру в активне вікно
        await self.read_message(message_id=event["message"]["id"])
        
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))