from django.urls import path
from .views import *
urlpatterns = [
    path('', PostView.as_view()),
    path('create_post/', CreatePostView.as_view(), name = 'create_post')
]
