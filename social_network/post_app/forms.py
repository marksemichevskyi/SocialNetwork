from django import forms
from .models import *
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

MAX_COMPRESSED_SIZE = 5 * 1024 * 1024


class MultipleFilesInput(forms.ClearableFileInput):
    allow_multiple_selected = True
    
class MultipleFilesField(forms.FileField):
    def clean(self, data, initial = None):
        
        
        if isinstance(data, (list, tuple)):
            list_files = []
            for file in data:
                cleaned_file = super().clean(file, initial)
                list_files.append(cleaned_file)
            return list_files
        
        return super().clean(file, initial)

class PostForm(forms.ModelForm):
    tags = forms.ModelMultipleChoiceField(
        label = 'Оберіть теги',
        required=False, 
        queryset = PostTag.objects.all(),
        widget= forms.CheckboxSelectMultiple,
    )
        
    images = MultipleFilesField(
        label = 'Зображення',
        required= False,
        widget= MultipleFilesInput(
            attrs={'multiple': True, 'accept': 'images/*', 'secret_key' : forms.HiddenInput()}
            
        )
    )

    
    class Meta:
        model = Post
        fields = ('title', 'topic', 'content')
        widgets = {
            'title': forms.TextInput(attrs= {
                'placeholder': 'Напишіть назву публікації'
            }),
            'topic': forms.TextInput(attrs= {
                'placeholder': 'Напишіть тему публікації'
            }),
            'content': forms.TextInput(attrs= {
                'placeholder': 'Введіть текст публікації'
            }),
            
        }
        
        labels = {
            'title': 'Назва публікації',
            'topic': 'Тема публікації',
            'content': 'Зміст публікації'
        }
    def __init__(self,links = None, images = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.links_list = []
        self.images_list = []
        
        if links:
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
                url_field.clean(value = link)
            except forms.ValidationError:
                self.add_error(None, 'Посилання не дійсне')
                
        for image in self.images_list:
            try:
                image_field.clean(value = image)
            except forms.ValidationError:
                self.add_error(None, 'Не вдалося заванажити зображення')
        return cleaned_data
    
    def compress_image(self, image):
        image.seek(0)
        image_object = Image.open(image)
        image_object = image_object.convert('RGB')

        quality = 85
        width = image_object.size[0]
        height = image_object.size[1]
        
        
        while True:
            buffer = BytesIO()
            image_object.save(buffer, format = 'JPEG', quality = quality, optimize = True)
            
            if buffer.tell() < MAX_COMPRESSED_SIZE:
                break
            
            else:
                if quality > 40:
                    quality -= 10
                
                else:
                    width = int(width * 0.9)
                    height = int(height * 0.9)
                    image_object = image_object.resize((width, height))
            
            image.seek(0)
            compressed_name = f'compressed_{image.name.rsplit('.', 1)[0]}.jpeg'
            return ContentFile(buffer.getvalue(), name = compressed_name)
                
    def save(self, author, commit = True):
        post = super().save(commit= False)
        post.author = author
        
        if commit:
            post.save()
            post.tags.set(self.cleaned_data.get('tags'))
            
            for link in self.links_list:
                PostLink.objects.create(post = post, url = link)
                
            for image in self.images_list:
                PostImage.objects.create(
                    post = post,
                    original = image,
                    compressed = self.compress_image(image)
                )
        return post
    
                
        
        
                    
        
        