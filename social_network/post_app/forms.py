from django import forms
from .models import *
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class MultipleFilesInput(forms.ClearableFileInput):
    allow_multiple_selected = True
    
class MultipleFilesField(forms.FileField):
    def clean(self, data, initial = True):
        cleaned_file = super().clean()
        
        if isinstance(data, (list, tuple)):
            return [cleaned_file(file, initial) for file in data]
        
        return cleaned_file(data, initial)

class PostForm(forms.ModelForm):
    tags = forms.ModelMultipleChoiceField(
        label = 'Теги',
        required=False, 
        queryset = PostTag.objects.all(),
        widget= forms.CheckboxSelectMultiple,
    )
        
    images = MultipleFilesField(
        label = 'Зображення',
        required= False,
        widget= MultipleFilesInput
    )

    links = forms.URLField(
        required= False,
        label= 'Посилання'
    )
    
    class Meta:
        model = Post
        fields = ('title', 'topic', 'content')
        widgets = {
            'title': forms.TextInput(attrs= {
                'placeholder': 'Напишіть назву публікації'
            }),
            'title': forms.TextInput(attrs= {
                'placeholder': 'Напишіть тему публікації'
            }),
            'title': forms.TextInput(attrs= {
                'placeholder': 'Введіть текст публікації'
            }),
            
        }
        
        labels = {
            'title': 'Назва публікації',
            'topic': 'Тема публікації',
            'content': ''
        }
    def __init__(self, *args, links = None, images = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['tags'].queryset = PostTag.objects.all()
        
        self.links_list = []
        self.images_list = []
        
        if links is None:
            links = []
        
        for link in links:
            cleaned_link = link.strip()
            if cleaned_link:
                self.links_list.append(cleaned_link)
        
        if images:
            self.images_list = list(images)
            
    def clean(self):
        cleaned_data = super().clean()
        url_field = forms.URLField()
        image_field = forms.ImageField()
        
        for link in self.links_list:
            try:
                url_field.clean(link)
            except forms.ValidationError:
                self.add_error(None, 'Посилання не дійсне')
                
        for image in self.images_list:
            try:
                image_field.clean(link)
            except forms.ValidationError:
                self.add_error(None, 'Не вдалося заванажити зображення')
        return cleaned_data
    
    def compress_image(self, image):
        image.seek(0)
        image_object = Image.open(image)
        image_object = image_object.convert('RGB')

        quality = 85
        width, height = image_object.size
        
        MAX_COMPRESSED_SIZE = 5 * 1024 * 1024
        
        while True:
            buffer = BytesIO()
            image_object.save(buffer, format = 'PNG', quality = quality, optimize = True)
            
            if buffer.tell() <= MAX_COMPRESSED_SIZE:
                break
            
            if quality > 35:
                quality -= 10
                
            elif width <=1 or height <=1:
                break
            
            else:
                width = int(width * 0.9)
                height = int(height * 0.9)
                image_object = image_object.resize((width, height), Image.Resampling.LANCZOS)
            
            image.seek(0)
            compressed_name = f'compressed_{image.name.rsplit('.', 1)[0]}.png'
            return ContentFile(buffer.getvalue(), name = compressed_name)
                
    def save(self, author, commit = True):
        post = super().save(commit= False)
        post.author = author
        
        if commit:
            post.save()
            post.tags.set(self.cleaned_data['tags'])
            
            for url in self.links_list:
                PostLink.objects.create(post = post, url = url)
                
            for image in self.images_list:
                PostImage.objects.create(
                    post = post,
                    original = image,
                    compressed = self.compress_image(image)
                )
        return post
    
                
        
        
                    
        
        