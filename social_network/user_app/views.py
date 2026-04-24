from django.shortcuts import render
from django.views.generic import TemplateView, View
from .forms import *
from django.http import JsonResponse

# Create your views here.
class UserView(TemplateView):
    template_name = "settings.html"
    
class AuthView(TemplateView):
    template_name = "auth.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form_register"] = RegisterForm()
        context["form_login"] = AuthForm()
        return context 
    
    
class RegisterView(View):
    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save
            return JsonResponse(data = {
                'success': True
            })
        return JsonResponse(data = {
                'success': False
        })
class LoginView(View):
    def post(self, request):
        form = AuthForm(request.POST)
        if form.is_valid():
            form.save
            return JsonResponse(data = {
                'success': True
            })
        return JsonResponse(data = {
                'success': False
        })