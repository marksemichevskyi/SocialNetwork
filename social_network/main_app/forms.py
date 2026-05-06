from django import forms
from user_app.models import *

class UsernameForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ('pseudonym', 'username')
        widgets = {
            'pseudonym': forms.TextInput(attrs= {
                'placeholder': 'Введіть Псевдонім автора'
            }),
            'username': forms.TextInput(attrs= {
                'placeholder': '@'
            })
        }
        
        labels = {
            'pseudonym': 'Псевдонім автора ',
            'username': 'Ім’я користувача'
        }
         
    def clean(self):
        data = super().clean()
        username = data.get('username')
        if User.objects.filter(username = username).exists():
            raise forms.ValidationError(message = 'Таке ім’я вже існує')
        return data
    
    def clean_username(self):
        value = self.cleaned_data['username']
        if not value.startswith('@'):
            value = '@' + value
        return value
    
    def save(self, commit = True):
        user = super().save(commit = False)
        # user.set_password(self.cleaned_data["password"])
        user.save()
        return user
