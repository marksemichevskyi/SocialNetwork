from django.shortcuts import render
from django.views.generic import TemplateView,View
from django.contrib.auth.mixins import LoginRequiredMixin
from .utils.friends import get_friends_by_section
from django.template.loader import render_to_string
from django.core.paginator import Paginator
from django.http import JsonResponse
from .utils.friends_actions import *
from user_app.models import User

# Create your views here.
class FriendsView(LoginRequiredMixin, TemplateView):
    template_name = 'friends.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['sections'] = {
            'requests': {"title" : 'Запити', "users": get_friends_by_section(current_user = self.request.user, section = "requests")[:3]},
            'recommendations': {"title" : 'Рекомендації', "users": get_friends_by_section(current_user = self.request.user, section = "recommendations")[:6]},
            'friends': {"title" : 'Друзі', "users": get_friends_by_section(current_user = self.request.user, section = "friends")[:6]},
        }
        
        return context
    
class FriendsSectionView(View):
    def get(self, request, section):
        users = get_friends_by_section(current_user=request.user, section = section)
        page_num = request.GET.get('page')
        page = Paginator(users, 10).get_page(page_num)
        html = render_to_string(
            'parts/friends_cards.html',
            {'users': page.object_list, 
             'section': section}
        )
        return JsonResponse({'html': html, "has_next": page.has_next()})


class FriendActionView(LoginRequiredMixin, View):
    def post(self, request, action, user_id):
        other_user = User.objects.get(id = user_id)
        user = request.user
        

        if action == 'add':
            return JsonResponse(add_friend_request(user, other_user))
        elif action == 'delete':
            return JsonResponse(delete_friendship(user, other_user))
        elif action == 'accept':
            data = accept_friend_request(user, other_user)
            data['friend_html'] = render_to_string(
                'user_app/particles/friends/friend_cards.html',
                {'users': [other_user], 'section': 'friends'}
            )
            
        elif action == 'ignore':
            return JsonResponse(ignore_friendship(user, other_user))
        
        return JsonResponse(data)
    