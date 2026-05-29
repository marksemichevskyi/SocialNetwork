from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Chat
from friends_app.models import *
from user_app.models import *
from friends_app.utils.friends import  *
# Create your views here.

class ChatView(LoginRequiredMixin, TemplateView):
    template_name = "chat.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        chats = Chat.objects.filter(is_group = False, users = self.request.user)
        data = []
        for chat in chats:
            other_user = chat.users.exclude(id = self.request.user.id).first()
            data.append({
                "chat_id": chat.id,
                "other_user":  other_user
            })
        context["individual_chats"] = data
        
        groups = Chat.objects.filter(is_group = True, users = self.request.user)
        group_data = []
        for group in groups :
            group_name = group.name
            group_data.append({

                "name" : group_name,
                
            })
        context["group_chats"] = group_data
        
        friends = get_friends_by_section(current_user= self.request.user, section = 'friends')
        print(friends)
        friends_data =[]
        for friend in friends:
            friends_data.append({
                'friend': friend
                })
        context['friends'] = friends_data  
        print(context['friends'])
        return context