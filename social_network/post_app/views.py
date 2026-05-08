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

class CreatePostView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        
        links_data = request.POST.getlist('link')
        images_data = request.FILES.getlist('images')

        form = PostForm(
            data=request.POST,
            files=request.FILES,
            links=links_data,
            images=images_data
        )

        if form.is_valid():
            form.save(author=request.user)
            return JsonResponse({'success': True})
            
        return JsonResponse({
            'success': False, 
            'errors': form.errors.get_json_data()
        }, status=400)