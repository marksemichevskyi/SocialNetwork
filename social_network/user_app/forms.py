from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate
from .models import *

class RegisterForm(forms.ModelForm):
    password = forms.CharField(
        label= "Пароль",
        widget= forms.PasswordInput(attrs= {
            "placeholder":"Введи пароль"
            
        })
    )
    
    confirm_password = forms.CharField(
        label= "Підтвери пароль",
        widget= forms.PasswordInput(attrs= {
            "placeholder":"Повтори пароль"
        })
    )  
    
    class Meta:
        model = User
        fields = ['email']
        label = 'Електронна пошта'
        widget= forms.EmailInput(attrs= {
            "placeholder":"you@example.com"
            
        })
        
    def clean(self):
        data = super().clean()
        pass1 = data.get('password')
        pass2 = data.get('confirm_password')
        password_length = len(pass1)
        if pass1 and pass2 and pass1 != pass2:
           raise forms.ValidationError(message = 'Паролі не співпадають') 
        elif pass1 and pass2 and password_length < 6:
            raise forms.ValidationError(message = 'Пароль має бути довше 6 символів') 
        return data
            
    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email = email).exists():
            raise forms.ValidationError(message = 'Пошта вже існує')
        return email
    
    def save(self, commit = True):
        user = super().save(commit = False)
        user.set_password(self.cleaned_data["password"])
        user.save()
        return user
        
        
class AuthForm(AuthenticationForm):
    password = forms.CharField(
        label= "Пароль",
        widget= forms.PasswordInput(attrs= {
            "placeholder":"Введи пароль"
            
        })
    )
    
    username = forms.EmailField(
        label= "Електронна пошта",
        widget= forms.EmailInput(attrs= {
            "placeholder":"you@example.com"
        })
    )  
    
    def clean(self):
        print(self.cleaned_data)
        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        if password and email:
            self.user_cache = authenticate(self.request, username = email, password = password)
            if not self.user_cache:
                raise forms.ValidationError(message = 'Неправильна пошта або пароль')
            else:
                self.confirm_login_allowed(user = self.user_cache)
        return self.cleaned_data
    
class ConfirmEmail(forms.Form):
    digit1 = forms.CharField(widget= forms.TextInput(attrs= {"placeholder":'_'}), max_length=1, label = '')
    digit2 = forms.CharField(widget= forms.TextInput(attrs= {"placeholder":'_'}), max_length=1, label = '')
    digit3 = forms.CharField(widget= forms.TextInput(attrs= {"placeholder":'_'}), max_length=1, label = '')
    digit4 = forms.CharField(widget= forms.TextInput(attrs= {"placeholder":'_'}), max_length=1, label = '')
    digit5 = forms.CharField(widget= forms.TextInput(attrs= {"placeholder":'_'}), max_length=1, label = '')
    digit6 = forms.CharField(widget= forms.TextInput(attrs= {"placeholder":'_'}), max_length=1, label = '')
    
    def clean(self):
        digit1 = self.cleaned_data.get('digit1')
        digit2 = self.cleaned_data.get('digit2')
        digit3 = self.cleaned_data.get('digit3')
        digit4 = self.cleaned_data.get('digit4')
        digit5 = self.cleaned_data.get('digit5')
        digit6 = self.cleaned_data.get('digit6')
        list_numbers = ["0","1","2","3","4","5","6","7","8","9"]
        list_digits = [digit1, digit2, digit3, digit4, digit5, digit6]
        
        
        for digit in list_digits:
            if not digit:
                raise forms.ValidationError(message = 'Усі віконця мають бути заповненими')
            elif digit not in list_numbers:
                raise forms.ValidationError(message = 'Ви ввели не число ')
        return self.cleaned_data
    