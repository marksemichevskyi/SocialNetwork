from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.
class RenderPost(TemplateView):
    template_name = "post.html"