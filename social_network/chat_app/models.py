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
