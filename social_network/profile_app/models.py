from django.db import models
from user_app.models import User
# Create your models here.
class Profile(models.Model): 
    pseudonym = models.CharField(
        max_length= 150,
        unique= False,
        blank = True,
        null= True,
        
    )
    user = models.OneToOneField(User, related_name= 'profile', on_delete= models.CASCADE)
    is_text_signature = models.BooleanField(default=False)
    is_image_signature = models.BooleanField(default=False)