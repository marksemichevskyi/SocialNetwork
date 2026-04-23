from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.
class UserView(TemplateView):
    template_name = "settings.html"
    
class AuthView(TemplateView):
    template_name = "auth.html"