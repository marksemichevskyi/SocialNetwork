from django.urls import path
from .views import *
from post_app.views import PostListView 
urlpatterns = [
    path('', FriendsView.as_view()),
    
    # Секції друзів
    path('<str:section>/', FriendsSectionView.as_view(), name='friends_section'),
    
    # 1. ТУТ ЗМІНЮЄМО ІМ'Я НА 'friend_page_simple' (якщо десь використовується без секції)
    path('friend_page/<int:user_id>/', FriendProfileView.as_view(), name='friend_page_simple'),
    
    # 2. ТУТ СТАВИМО ОСНОВНЕ ІМ'Я 'friend_page', яке очікує ваш шаблон (приймає 'requests' та ID)
    path('friend_page/<str:section>/<int:user_id>/', FriendProfileView.as_view(), name='friend_page'),
    
    # Дії з друзями
    path('<str:action>/<int:user_id>/', FriendProfileView.as_view(), name='friends_actions'),

]
