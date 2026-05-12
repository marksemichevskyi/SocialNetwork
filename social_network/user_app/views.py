from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from .forms import *
from .models import *
from django.http import JsonResponse
import random
from django.contrib.auth import login, logout
from django.core.mail import send_mail
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
            confirm_code = random.randint(100000, 999999)
            request.session['confirm_code'] = confirm_code
            request.session['register_data'] = form.cleaned_data
            
            send_mail(
                subject="Ваш код підтвердження", 
                message = f"Код: {confirm_code}",
                from_email='worldit.socialnetwork1111@gmail.com',
                recipient_list=[form.cleaned_data['email']],
                fail_silently= False
            )
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
    def post(self, request, *args, **kwargs):
        form = ConfirmEmail(request.POST)
        if form.is_valid():
            digit1 = form.cleaned_data.get('digit1')
            digit2 = form.cleaned_data.get('digit2')
            digit3 = form.cleaned_data.get('digit3')
            digit4 = form.cleaned_data.get('digit4')
            digit5 = form.cleaned_data.get('digit5')
            digit6 = form.cleaned_data.get('digit6')
            
            confirm_code = request.session.get('confirm_code')
            user_code = f"{digit1}{digit2}{digit3}{digit4}{digit5}{digit6}"
            
            if str(confirm_code) != user_code:
                return JsonResponse({
                    'success': False,
                    'errors': form.errors.get_json_data()
                })
            register_data = request.session.get('register_data')
            user = User.objects.create(
                email = register_data["email"]
            )
            user.set_password(register_data["password"])
            user.save()            
            return JsonResponse(data = {
                'success': True
            })
        return JsonResponse(data = {
                'success': False,
                "errors": form.errors.get_json_data()
        })
        
        
class LogoutView(View):
    def post(self, request):
        logout(request)
        return redirect("auth")