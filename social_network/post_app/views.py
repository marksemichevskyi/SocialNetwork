from django.shortcuts import render
from django.views.generic import TemplateView, FormView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import *
from django.urls import reverse_lazy
from django.http import JsonResponse

# Create your views here.
class PostView(LoginRequiredMixin, TemplateView):
    template_name = "post.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_post'] = PostForm()
        return context 

class CreatePostView(View):
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method == "POST":
            kwargs['links'] = self.request.POST.getlist('links')
            kwargs['images'] = self.request.POST.getlist('images')
        return kwargs
    
    def post(self, request, *args, **kwargs):
        form = PostForm(request.POST)
        if form.is_valid():
            form.save(request.user)
            return JsonResponse(data = {
                'success': True,
            })
            
        return JsonResponse(data = {
            'success': False,
            "errors": form.errors.get_json_data()
        })