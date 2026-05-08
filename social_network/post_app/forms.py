from django import forms
from .models import Post, PostTag, PostLink, PostImage
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

MAX_COMPRESSED_SIZE = 5 * 1024 * 1024

class MultipleFilesInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFilesField(forms.FileField):
    def clean(self, data, initial=None):
        if isinstance(data, (list, tuple)):
            list_files = []
            for file in data:
                cleaned_file = super().clean(file, initial)
                list_files.append(cleaned_file)
            return list_files
        return super().clean(data, initial)

class PostForm(forms.ModelForm):
    tags = forms.ModelMultipleChoiceField(
        label='Оберіть теги',
        required=False,
        queryset=PostTag.objects.all(),
        widget=forms.CheckboxSelectMultiple,
    )
        
    images = MultipleFilesField(
        required=False,
        label = '',
        widget=MultipleFilesInput(attrs={'multiple': True, 'accept': 'image/*', 'id': 'image-input'})
    )

    class Meta:
        model = Post
        fields = ('title', 'topic', 'content')
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Напишіть назву публікації'}),
            'topic': forms.TextInput(attrs={'placeholder': 'Напишіть тему публікації'}),
            'content': forms.Textarea(attrs={'placeholder': 'Введіть текст публікації'}),
        }
        labels = {
            'title': 'Назва публікації',
            'topic': 'Тема публікації',
            'content': 'Зміст публікації'
        }

    def __init__(self, links=None, images=None, *args, **kwargs):
        
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
            if link:
                try:
                    url_field.clean(link)
                except forms.ValidationError:
                    self.add_error(None, f'Посилання "{link}" не дійсне')
                
        
        for image in self.images_list:
            try:
                image_field.clean(image)
            except forms.ValidationError:
                self.add_error(None, 'Не вдалося завантажити одне з зображень')
        
        return cleaned_data

    def compress_image(self, image):
        image.seek(0)
        image_object = Image.open(image)
        if image_object.mode != 'RGB':
            image_object = image_object.convert('RGB')

        quality = 85
        width, height = image_object.size
        
        buffer = BytesIO() 
        
        while True:
            buffer = BytesIO()
            image_object.save(buffer, format='JPEG', quality=quality, optimize=True)
            if buffer.tell() < MAX_COMPRESSED_SIZE or quality <= 10:
                break
            
            quality -= 10
            if quality <= 40:
                width = int(width * 0.9)
                height = int(height * 0.9)
                image_object = image_object.resize((width, height))
        
        
        name_parts = image.name.rsplit('.', 1)
        compressed_name = f'compressed_{name_parts[0]}.jpeg'
        
        return ContentFile(buffer.getvalue(), name=compressed_name)

    def save(self, author, commit=True):
        post = super().save(commit=False)
        post.author = author
        
        if commit:
            post.save()
            
            self.save_m2m() 
            
           
            for link in self.links_list:
                if link.strip():
                    PostLink.objects.create(post=post, url=link.strip())
            
            
            for image in self.images_list:
                PostImage.objects.create(
                    post=post,
                    original=image,
                    compressed=self.compress_image(image)
                )
        return post
                
        
        
                    
        
        