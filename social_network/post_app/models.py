from django.db import models
from user_app.models import User
# Create your models here.
class PostTag(models.Model):
    name = models.CharField(max_length= 50, unique= True)
    def __str__(self):
        return self.name
class Post(models.Model):
    title = models.CharField(max_length= 150)
    topic = models.CharField(max_length= 100)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete = models.CASCADE, related_name= 'posts')
    created_at = models.DateTimeField(auto_now_add= True)
    tags = models.ManyToManyField(PostTag, related_name= 'posts')
    def __str__(self):
        return self.title
    
class PostLink(models.Model):
    url = models.URLField(max_length= 255)
    post = models.ForeignKey(Post, on_delete= models.CASCADE, related_name= 'links')
    def __str__(self):
        return self.url
    
class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete= models.CASCADE, related_name= 'images')
    original = models.ImageField(upload_to='post_images/original_images')
    compressed = models.ImageField(upload_to='post_images/compressed_images')
    