from django.shortcuts import render, redirect
from django.views.generic import TemplateView, FormView, View, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import PostTagForm, PostForm
from .models import *
from django.core.paginator import Paginator
from django.template.loader import render_to_string
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

        context['posts'] = Post.objects.all().order_by('-created_at')[:5] 

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




class AddTagView(View):

    def post(self, request, *args, **kwargs):
        tag_form = PostTagForm(request.POST)

        if tag_form.is_valid():
            tag = tag_form.save()
            return JsonResponse({
                'success': True,
                'tag_id': tag.id,
                'tag_name': tag.name 
                })
        
        return JsonResponse({
            'success': False, 
            'errors': tag_form.errors.get_json_data()
        }, status=400)
      
class PostListView(ListView): 
    model = Post
    template_name = "post.html"
    paginate_by = 5
    context_object_name = "posts"

    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            page_number = request.GET.get('page')
            posts = self.get_queryset()
            paginator = Paginator(posts, self.paginate_by)
            post_list = paginator.get_page(page_number)
            if int(page_number) > paginator.num_pages :
                return JsonResponse({
                    'success' : False
                })
            else : 
                return JsonResponse({
                    'success' : True,
                    'html' : render_to_string(template_name = "post_list.html" , context = {"posts" : post_list})

                })
        return super().get(request, *args, **kwargs)

