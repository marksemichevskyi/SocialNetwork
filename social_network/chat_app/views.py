from django.shortcuts import render
from .models import Chat, Message
from friends_app.models import *
from user_app.models import *
from friends_app.utils.friends import  *
from django.views.generic import TemplateView , View
from django.contrib.auth.mixins import LoginRequiredMixin
from user_app.models import User
from django.http import JsonResponse
from django.core.paginator import Paginator
import json

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

        context["friends"] = get_friends_by_section(current_user = self.request.user, section = "friends")
        return context
    
class CreateChatView(LoginRequiredMixin, View): 
    def post(self, request):
        data = json.loads(request.body)
        friend_id = data.get('friend_id')
        friend = User.objects.filter(id = friend_id).first()

        chat = Chat.objects.filter(is_group = False, users = friend).filter(users = request.user).first()
        is_new_chat = False
        if not chat: 
            chat = Chat.objects.create(is_group = False )
            chat.users.set([request.user, friend])
            is_new_chat = True  
        print(chat)
        return JsonResponse({ "chat_id" : chat.id, "friend_pseudonym" : friend.pseudonym, 'is_new': is_new_chat})    
    
    
class GetMessagesView(View):
    def get(self, request, chat_id, *args, **kwargs):
        chat = Chat.objects.filter(id = chat_id, users = request.user).first()
        if chat:
            page_number = request.GET.get("page")
            messages = chat.messages.order_by('-created_at')
            paginator = Paginator(messages, 20)
            message_list = paginator.get_page(page_number)
            if int(page_number) > paginator.num_pages:
                return JsonResponse({"success" : False})
            else:
                message_data_list = []
                for message in message_list:
                    message_data_list.append({
                        'sender': message.sender.pseudonym,
                        'text': message.text,
                        'datetime': message.created_at.isoformat(),
                        'current_user': self.request.user.pseudonym
                    })
                return JsonResponse({
                    "success" : True,
                    "messages": message_data_list
                })