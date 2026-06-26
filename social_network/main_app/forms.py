from django import forms
from user_app.models import User
from profile_app.models import Profile
from post_app.forms import *

class UsernameForm(forms.ModelForm):
    pseudonym = forms.CharField(
        max_length=150,
        required=True,
        label='Псевдонім автора',
        widget=forms.TextInput(attrs={
            'placeholder': 'Введіть Псевдонім автора'
        })
    )

    class Meta:
        model = User
        fields = ('username',) 
        widgets = {
            'username': forms.TextInput(attrs={
                'placeholder': '@'
            })
        }
        labels = {
            'username': 'Ім’я користувача'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, 'profile'):
            self.fields['pseudonym'].initial = self.instance.profile.pseudonym

    def clean_username(self):
        value = self.cleaned_data.get('username')
        if not value:
            return value
            
        if not value.startswith('@'):
            value = '@' + value
            
        queryset = User.objects.filter(username=value)
        if self.instance.pk:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise forms.ValidationError('Таке ім’я вже існує')
            
        return value

    # ТЕПЕР МЕТОД SAVE ВСЕРЕДИНІ КЛАСУ (ДОДАНО ВІДСТУПИ)
    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        
        # Передаємо обидва поля в defaults для створення запису
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'is_text_signature': False,
                'is_image_signature': False,
            }
        )
        
        # Оновлюємо дані профілю
        profile.pseudonym = self.cleaned_data.get('pseudonym')
        
        # Примусово виставляємо False для обох полів перед збереженням
        profile.is_text_signature = False
        profile.is_image_signature = False
            
        if commit:
            profile.save()
            
        user.profile = profile 
        return user