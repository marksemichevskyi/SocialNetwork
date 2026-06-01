from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View, ListView
from .forms import *
from .models import *
from user_app.views import *
from django.http import JsonResponse
from post_app.models import *
from post_app.forms import *
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.template.loader import render_to_string

# Create your views here.
class MainView(TemplateView):
    template_name = "main.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form_username"] = UsernameForm()
        context['form_post'] = PostForm()
        context["tag_form"] = PostTagForm()
        context['tags'] = PostTag.objects.all()
        context['posts'] = Post.objects.all().order_by('-created_at')[:5] 
        
        return context 
    
class PostListView(LoginRequiredMixin, ListView): 
    model = Post
    template_name = "main.html"
    paginate_by = 5
    context_object_name = "posts"

    def get_queryset(self): 
        return Post.objects.all()


    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            page_number = request.GET.get('page')
            posts = self.get_queryset()
            paginator = Paginator(posts, self.paginate_by)
            post_list = paginator.get_page(page_number)
            
            if int(page_number) > paginator.num_pages:
                return JsonResponse({'success': False})
            else: 
                return JsonResponse({
                    'success': True,
                    'html': render_to_string(
                        template_name="post_list.html", 
                        context={"posts": post_list, "request": request}
                    )
                })
        return super().get(request, *args, **kwargs)
    
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