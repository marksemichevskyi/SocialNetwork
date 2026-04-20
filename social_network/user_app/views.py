from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.
class RenderUser(TemplateView):
    template_name = "settings.html"