from django.db import models
from user_app.models import User
# Create your models here.
class Friendship(models.Model):
    from_user = models.ForeignKey(User, on_delete= models.CASCADE, related_name= 'send_friendship')
    to_user = models.ForeignKey(User, on_delete= models.CASCADE, related_name= 'received_friendship')
    created_at = models.DateTimeField(auto_now_add= True)
    status = models.CharField(max_length= 15, default= 'pending')
    
    class Meta:
        unique_together = ('from_user', 'to_user')