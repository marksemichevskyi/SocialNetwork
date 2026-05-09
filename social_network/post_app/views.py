from django.shortcuts import render, redirect
from django.views.generic import TemplateView, FormView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import PostTagForm, PostForm
from .models import *
from django.urls import reverse_lazy
from django.http import JsonResponse

# Create your views here.
class PostView(LoginRequiredMixin, TemplateView):
    template_name = "post.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['form_post'] = PostForm()

        context['tag_form'] = PostTagForm()

        context['tags'] = PostTag.objects.all()

        return context

class CreatePostView(LoginRequiredMixin, View):

    def post(self, request, *args, **kwargs):

        form = PostForm(
            request.POST,
            request.FILES,
            links=request.POST.getlist("links"),
            images=request.FILES.getlist("images"),
        )

        if form.is_valid():
            form.save(author=request.user)

            return JsonResponse({
                'success': True
            })

        return JsonResponse({
            'success': False,
            'errors': form.errors.get_json_data()
        }, status=400)

        if form.is_valid():
            form.save(author=request.user)
            return JsonResponse({'success': True})
            
        return JsonResponse({
            'success': False, 
            'errors': form.errors.get_json_data()
        }, status=400)


class AddTagView(View):

    def post(self, request, *args, **kwargs):
        tag_form = PostTagForm(request.POST)

        if tag_form.is_valid():
            tag_form.save()
            return JsonResponse({'success': True})
        
        return JsonResponse({
            'success': False, 
            'errors': tag_form.errors.get_json_data()
        }, status=400)
      