from django.urls import path

from .views import PostView, CreatePostView, AddTagView

urlpatterns = [
    path('', PostView.as_view(), name='post_home'),
    path('create_post/', CreatePostView.as_view(), name='create_post'),
    path("add_tag/", AddTagView.as_view(), name="add_tag"),
]

