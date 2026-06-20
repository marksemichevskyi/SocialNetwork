import json
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile
from .models import Chat, Message, MessageImage  # Додав модель для картинок

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
        text = data.get("msg", "")
        images = data.get("images", [])  # Отримуємо масив картинок
        
        # Спрацьовує, якщо є або текст, або хоча б одне зображення
        if text.strip() or images:
            # Передаємо і текст, і картинки на збереження
            message = await self.save_message(text, images)
            current_user_id = self.scope.get("user").id
            
            # Надсилаємо сповіщення в персональні групи ІНШИХ учасників чату
            for member_id in message['members_id']:
                if member_id != current_user_id:
                    await self.channel_layer.group_send(
                        f"user_{member_id}",
                        {
                            'type': 'chat_list_update',
                            'chat_id': self.chat_id,
                            'message_data': message,
                        }
                    )
            
            # Надсилаємо саме повідомлення в кімнату чату
            await self.channel_layer.group_send(
                self.room_group_name, 
                {
                    "type": "chat_message",
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
    def save_message(self, text, images):
        user = self.scope.get("user")
        # 1. Створюємо повідомлення
        new_message = Message.objects.create(text=text, chat_id=self.chat_id, sender=user)
        
        saved_images_urls = []
        
        # 2. Обробляємо кожну картинку з Base64
        for img in images:
            img_name = img.get("name", "image.png")
            img_data = img.get("data", "")
            
            if img_data and ';base64,' in img_data:
                format, imgstr = img_data.split(';base64,')
                ext = format.split('/')[-1]
                
                # Декодуємо Base64 рядок у бінарний файл
                file_data = ContentFile(base64.b64decode(imgstr), name=f"{img_name}.{ext}")
                
                # Зберігаємо у базу даних (залежно від твоєї структури моделей)
                # Якщо картинок декілька, створюємо об'єкти пов'язаної моделі:
                img_instance = MessageImage.objects.create(message=new_message, image=file_data)
                saved_images_urls.append(img_instance.image.url)
                
                # АБО якщо у тебе ОДНА картинка прямо в моделі Message, то просто:
                # new_message.image = file_data
                # new_message.save()
                # saved_images_urls.append(new_message.image.url)

        members_id = list(new_message.chat.users.values_list('id', flat=True))
        sender_pseudonym = user.profile.pseudonym if hasattr(user, 'profile') else "Користувач"
        
        return {
            'id': new_message.id,
            'sender_id': user.id,                                     
            'sender_pseudonym': sender_pseudonym,           
            'text': new_message.text,
            'datetime': new_message.created_at.isoformat(),    
            'date': str(new_message.created_at.date()),        
            'images': saved_images_urls,  # Тепер тут список реальних URL-адрес картинок
            'members_id': members_id
        }
        
    @database_sync_to_async   
    def read_message(self, message_id):
        user = self.scope.get("user")
        message = Message.objects.filter(id=message_id).first()
        if message and user != message.sender:
            message.readers.add(user)

    async def chat_message(self, event):
        await self.read_message(message_id=event["message"]["id"])
        
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))