from channels.generic.websocket import AsyncWebsocketConsumer
import json

# Глобальний словник (працює коректно тільки на одному процесі воркера)
online_users = {}

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.room_group_name = 'presence'
        self.user_group_name = f'user_{self.user.id}'
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()
        
        # Облік онлайну
        if self.user.id in online_users:
            online_users[self.user.id] += 1
        else:
            online_users[self.user.id] = 1
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': "send_status",
                    'status': True,
                    'user_id': self.user.id
                }
            )

        # Віддаємо список тих, хто онлайн
        await self.send(json.dumps({
            'type': 'get_online',
            'online_users': list(online_users.keys()),
        }))

    async def disconnect(self, code):
        if hasattr(self, 'user') and self.user.is_authenticated:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
            
            if self.user.id in online_users:
                online_users[self.user.id] -= 1
                if online_users[self.user.id] <= 0:
                    del online_users[self.user.id]
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': "send_status",
                            'status': False,
                            'user_id': self.user.id
                        }
                    )

    async def receive(self, text_data):
        # Запит списку онлайн-користувачів від фронтенду
        await self.send(json.dumps({
            'type': 'get_online',
            'online_users': list(online_users.keys()),
        }))

    # Обробник події "type": "send_status" (хтось зайшов/вийшов)
    async def send_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'presence_update',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    # Обробник події "type": "chat_list_update" (прилітає з chat_app)
    async def chat_list_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'sidebar_notification',
            'chat_id': event['chat_id']
        }))