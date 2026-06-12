from django.shortcuts import render
from .models import Chat, Message, MessageImage
from friends_app.models import *
from user_app.models import *
from friends_app.utils.friends import  *
from django.views.generic import TemplateView , View
from django.contrib.auth.mixins import LoginRequiredMixin
from user_app.models import User
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.utils.timezone import localtime
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from user_app.consumers import online_users

# Create your views here.

class ChatView(LoginRequiredMixin, TemplateView):
    template_name = "chat.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        chats = Chat.objects.filter(is_group = False, users = self.request.user)
        groups = Chat.objects.filter(is_group = True, users = self.request.user)
        data = []
        group_data = []
        for group in groups:
            latest_message = group.messages.order_by('-created_at').first()
            group_data.append({
                'group_name': group.name,
                "group_id": group.id,
                "latest_time": localtime(latest_message.created_at).isoformat() if latest_message else "",
                "latest_message": latest_message
                })
            
        for chat in chats:
            other_user = chat.users.exclude(id = self.request.user.id).first()
            latest_message = chat.messages.order_by('-created_at').first()
            data.append({
                "chat_id": chat.id,
                "other_user":  other_user,
                "latest_time": localtime(latest_message.created_at).isoformat() if latest_message else "",
                "latest_message": latest_message
            })
        context["individual_chats"] = data
        context["group_chats"] = group_data
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
        friend_pseudonym = friend.profile.pseudonym if hasattr(friend, 'profile') else friend.email
        return JsonResponse({ "chat_id" : chat.id, "friend_pseudonym" : friend_pseudonym, 'is_new': is_new_chat})    
    
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
                    if message.sender != request.user: 
                        message.readers.add(request.user)
                    sender_pseudonym = message.sender.profile.pseudonym if hasattr(message.sender, 'profile') else "Користувач"
                    list_url_image = []
                    for image in message.images.all():
                        list_url_image.append(image.image.url)
                        
                    if not sender_pseudonym:
                        sender_pseudonym = "Користувач"

                    message_data_list.append({
                        'sender_pseudonym': sender_pseudonym,
                        'sender_id' : message.sender.id,
                        'text': message.text,
                        'datetime': localtime(message.created_at).isoformat(), 
                        'current_user': self.request.user.id,
                        'message_id': message.chat_id,
                        'date': message.created_at.date(),
                        'images': list_url_image
                    })
                return JsonResponse({
                    "success" : True,
                    "messages": message_data_list
                })
                
class CreateGroupView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        
        new_chat = Chat.objects.create(
            is_group = True, 
            admin = request.user, 
            name = data.get('name'), 
        )
        new_chat.users.add(request.user)
        
        user_friends = get_friends_by_section(current_user= request.user, section= 'friends')
        for user_id in data.get('friends'):
            user = User.objects.filter(id = user_id).first()
            if user in user_friends:
                new_chat.users.add(user)
                
        return JsonResponse({
            'success': True,
            'name': new_chat.name,
            'chat_id':new_chat.id
        })
        
class CreateMessageView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        print(request.POST, request.FILES)
        chat_id = request.POST.get("chat_id")
        chat = Chat.objects.filter(id = chat_id, users = request.user).first()
        if chat:
            new_message = Message.objects.create(
                text = request.POST.get("text"), 
                chat_id=chat.id, 
                sender=request.user
            )
            sender_pseudonym = new_message.sender.profile.pseudonym if hasattr(new_message.sender, 'profile') else "Користувач"
            list_url_image = []
            for image in request.FILES.getlist('image'):
                new_image = MessageImage.objects.create(
                    image = image,
                    message = new_message 
                )
                list_url_image.append(new_image.image.url)
            
            channel_layer = get_channel_layer()
            
            async_to_sync(channel_layer.group_send)(
                f"chat_{chat.id}", 
                {
                    "type": "send_message",
                    "message": {
                        'sender_pseudonym': sender_pseudonym,
                        "sender_id": new_message.sender.id,
                        "datetime": localtime(new_message.created_at).isoformat(), 
                        "date" : new_message.created_at.date(),
                        'text': new_message.text,
                        'images': list_url_image,
                    },
                }
            )
            
            return JsonResponse({"success": True})
        return JsonResponse({"success": False})
    
    
class GetGroupUsersView(LoginRequiredMixin, View):
    def get(self, request, id):
        chat = Chat.objects.filter(id = id, users = request.user).first()
        if chat != None and chat.is_group:
            users_id = []
            online_users_id = []
            for user in chat.users.all():
                users_id.append(user.id)
                if user.id in online_users:
                    online_users_id.append(user.id)
            return JsonResponse({
                "success": True,
                'name': chat.name,
                'users_id': users_id,
                'online_users_id': online_users_id,
            })
        return JsonResponse({"success": False})