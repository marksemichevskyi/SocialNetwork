from django.urls import path
from .views import *
urlpatterns = [
    path('settings/', UserView.as_view(), name= 'settings'),
    path('auth/', AuthView.as_view(), name = 'auth'),
    path('register/', RegisterView.as_view(), name = 'register'),
    path('login/', LoginView.as_view(), name = 'login'),
    path('confirm_email/', ConfirmEmailView.as_view(), name = 'confirm_email'),
    path('logout/', LogoutView.as_view(), name = "logout")
]
