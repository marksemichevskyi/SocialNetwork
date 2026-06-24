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
from friends_app.models import Friendship
from chat_app.models import Chat, Message
from django.utils.timezone import localtime, now
# Create your views here.
from django.db.models import Max

class MainView(TemplateView):
    template_name = "main.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        context.update({
            "form_username": UsernameForm(),
            "form_post": PostForm(),
            "tag_form": PostTagForm(),
            "tags": PostTag.objects.all(),
            "posts": Post.objects.select_related('author').order_by('-created_at')[:5]
        })

        user = self.request.user
        if not user.is_authenticated:
            return context

        context["recent_requests"] = Friendship.objects.filter(
            to_user=user, 
            status="pending"
        ).select_related('from_user__profile').order_by('-created_at')[:3]

        recent_chats = Chat.objects.filter(users=user) \
            .annotate(last_msg_time=Max('messages__created_at')) \
            .filter(last_msg_time__isnull=False) \
            .order_by('-last_msg_time')

        recent_messages = []
        # Поточна дата сервера з урахуванням таймзони
        today_date = now().date() 

        for chat in recent_chats[:3]:
            last_msg = chat.messages.order_by('-created_at').first()
            
            if last_msg:
                last_msg_local = localtime(last_msg.created_at)
                last_sender_msg = chat.messages.exclude(sender=user).order_by('-created_at').first()
                
                recent_messages.append({
                    "chat_name": chat.name,
                    "chat_id": chat.id,
                    "last_message": last_msg.text,
                    "last_message_sender": last_sender_msg.sender if last_sender_msg else None,
                    "last_message_date": last_msg_local,
                    # Булеве значення: True, якщо повідомлення створено сьогодні
                    "is_today": last_msg_local.date() == today_date  
                })

        context["recent_messages"] = recent_messages
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
    
class UsernameView(LoginRequiredMixin, View): 
    def get(self, request):
        user = request.user

        if not hasattr(user, 'profile'):
            return JsonResponse({"needs_profile": True})
            

        pseudonym = user.profile.pseudonym
        
        if not pseudonym or pseudonym.strip() in ['', '@']:
            return JsonResponse({"needs_profile": True})
            
        return JsonResponse({"needs_profile": False})

    
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

