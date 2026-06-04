from django.urls import path
from .views import *
from post_app.views import PostListView 
urlpatterns = [
    path('', FriendsView.as_view()),
    path('<str:section>/', FriendsSectionView.as_view(), name='friends_section'),
    path('friend_page/<int:user_id>/', FriendProfileView.as_view(), name='friend_page_simple'),
    path('friend_page/<str:section>/<int:user_id>/', FriendProfileView.as_view(), name='friend_page'),
    path('<str:action>/<int:user_id>/', FriendProfileView.as_view(), name='friends_actions'),

]
