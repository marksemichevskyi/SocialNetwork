from django.shortcuts import render
from django.views.generic import TemplateView, View
from .forms import *
from django.http import JsonResponse
from django.contrib.auth import login
# Create your views here.
class UserView(TemplateView):
    template_name = "settings.html"
    
class AuthView(TemplateView):
    template_name = "auth.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form_register"] = RegisterForm()
        context["form_login"] = AuthForm(request=self.request)
        context['form_confirm'] = ConfirmEmail()
        return context 
    
    
class RegisterView(View):
    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse(data = {
                'success': True
            })
        return JsonResponse(data = {
                'success': False,
                "errors": form.errors.get_json_data()
                
        })
class LoginView(View):
    def post(self, request):
        form = AuthForm(request = request, data = request.POST)
        if form.is_valid():
            login(request = request, user = form.get_user())
            return JsonResponse(data = {
                'success': True
            })
        return JsonResponse(data = {
                'success': False,
                "errors": form.errors.get_json_data()
        })
        
class ConfirmEmailView(View):
    def post(self, request):
        form = ConfirmEmail(request.POST)
        if form.is_valid():
            return JsonResponse(data = {
                'success': True
            })
        return JsonResponse(data = {
                'success': False,
                "errors": form.errors.get_json_data()
        })