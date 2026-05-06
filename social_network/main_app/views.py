from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from .forms import *
from .models import *
from django.http import JsonResponse
# Create your views here.
class MainView(TemplateView):
    template_name = "main.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form_username"] = UsernameForm()
        return context 
    
class UsernameView(View):
    def get(self, request):
        user = request.user
        if not user.username:
            return JsonResponse({
                "needs_profile": True
            })
        elif user.username.strip() == '@':
            return JsonResponse({
                "needs_profile": True
            })
        else:
            return JsonResponse({
                "needs_profile": False
            })

    
    def post(self, request):
        form = UsernameForm(request.POST, instance=request.user)
        if not request.user.is_authenticated:
            return JsonResponse(data = {
                'success': False,
                "errors": form.errors.get_json_data()
                
        })
        if form.is_valid():

            form.save()

            return JsonResponse({"success": True})

        return JsonResponse({
            "success": False,
            "errors": form.errors.get_json_data()
        })