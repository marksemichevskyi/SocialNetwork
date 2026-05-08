from django.urls import path

from .views import PostView, CreatePostView 

urlpatterns = [
    path('', PostView.as_view(), name='post_home'),
    path('create_post/', CreatePostView.as_view(), name='create_post'),
]

