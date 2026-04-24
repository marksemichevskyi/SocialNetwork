from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate
from .models import *

class RegisterForm(forms.ModelForm):
    password = forms.CharField(
        label= "Пароль",
        widget= forms.PasswordInput(attrs= {
            "placeholder":" Введи пароль"
            
        })
    )
    
    confirm_password = forms.CharField(
        label= "Підтвери паролю",
        widget= forms.PasswordInput(attrs= {
            "placeholder":" Повтори пароль"
        })
    )  
    
    class Meta:
        model = User
        fields = ['email']
        label = 'Електронна пошта'
        widget= forms.EmailInput(attrs= {
            "placeholder":" you@example.com"
            
        })
        
class AuthForm(AuthenticationForm):
    password = forms.CharField(
        label= "Пароль",
        widget= forms.PasswordInput(attrs= {
            "placeholder":" Введіть пароль"
            
        })
    )
    
    username = forms.CharField(
        label= "Електронна пошта",
        widget= forms.EmailInput(attrs= {
            "placeholder":" you@example.com"
        })
    )  
    