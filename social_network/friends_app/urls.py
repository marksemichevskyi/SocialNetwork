from django.urls import path
from .views import *
urlpatterns = [
    path('', FriendsView.as_view()),
    path('<str:section>/', FriendsSectionView.as_view(), name = 'friends_section'),
    path('<str:action>/<int:user_id>/', FriendActionView.as_view(), name = 'friends_actions')
]
