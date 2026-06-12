from django.db import models
from user_app.models import User

# Create your models here.
class Chat(models.Model):
    name = models.CharField(max_length=30, blank=True, null=True)
    users = models.ManyToManyField(User, related_name="chats")
    is_group = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to="chat/avatars", blank=True, null=True)
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    
    def __str__(self):
        return f"<Chat: {self.name}>"
    
class Message(models.Model):
    text = models.CharField(max_length=255, blank=True, null=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add = True)
    readers = models.ManyToManyField(User, related_name="readed_messages")

    def __str__(self):
        return f"<Message: {self.text}>"


class MessageImage(models.Model):
    image = models.ImageField(upload_to= 'chat/message_images')
    message = models.ForeignKey(Message, on_delete= models.CASCADE, related_name="images")
    
    def __str__(self):
        return f"<Image, for message: {self.message.text}>"