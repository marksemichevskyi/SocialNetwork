from django.shortcuts import render
from django.views.generic import TemplateView,View
from django.contrib.auth.mixins import LoginRequiredMixin
from .utils.friends import get_friends_by_section
from django.template.loader import render_to_string
from django.core.paginator import Paginator
from django.http import JsonResponse
from .utils.friends_actions import *
from user_app.models import User
from django.shortcuts import get_object_or_404
from post_app.models import Post 
# Create your views here.
class FriendsView(LoginRequiredMixin, TemplateView):
    template_name = 'friends.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        current_user = self.request.user

        req_users = get_friends_by_section(current_user=current_user, section="requests")
        rec_users = get_friends_by_section(current_user=current_user, section="recommendations")
        fr_users = get_friends_by_section(current_user=current_user, section="friends")

        req_users = [u for u in req_users if u.id != current_user.id]
        rec_users = [u for u in rec_users if u.id != current_user.id]
        fr_users = [u for u in fr_users if u.id != current_user.id]

        context['sections'] = {
            'requests': {"title": 'Запити', "users": req_users[:3]},
            'recommendations': {"title": 'Рекомендації', "users": rec_users[:6]},
            'friends': {"title": 'Друзі', "users": fr_users[:6]},
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




class FriendProfileView(LoginRequiredMixin, TemplateView):
    template_name = "friend_page.html"

    def get(self, request, user_id, *args, **kwargs):
        friend = get_object_or_404(User, id=user_id)
        posts = Post.objects.filter(author=friend).order_by('-id')
        paginator = Paginator(posts, 5)
        page_number = request.GET.get('page', 1)
        post_list = paginator.get_page(page_number)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if int(page_number) > paginator.num_pages:
                return JsonResponse({'success': False})
            else:
                html = render_to_string(
                    template_name="post_list.html", 
                    context={"posts": post_list, "request": request}
                )
                return JsonResponse({'success': True, 'html': html})

        context = self.get_context_data(**kwargs)
        context['friend'] = friend
        context['posts'] = post_list
        context['section'] = kwargs.get('section', 'friends') 
        return self.render_to_response(context)

    def post(self, request, action, user_id, *args, **kwargs):
        user_id = int(user_id) 
        user = request.user

        if action == 'add' and user.id == user_id:
            return JsonResponse({
                'success': False, 
                'error': 'Ви не можете додавати в друзі самого себе!'
            }, status=400)

        print(f"=== ОТРИМАНО ЗАПИТ: action={action}, user_id={user_id} ===")
        
        try:
            other_user = get_object_or_404(User, id=user_id)
            
            if action == 'add':
                return JsonResponse(add_friend_request(user, other_user))
            elif action == 'delete':
                return JsonResponse(delete_friendship(user, other_user))
            elif action == 'ignore':
                return JsonResponse(ignore_friendship(user, other_user))
                
            elif action == 'accept':
                data = accept_friend_request(user, other_user) or {}
                
                try:
                    data['friend_html'] = render_to_string(
                        'parts/friends_cards.html', 
                        {'users': [other_user], 'section': 'friends'}
                    )
                except Exception as template_err:
                    print(f"Помилка шаблону: {template_err}")
                    data['friend_html'] = "" 
                
                return JsonResponse(data)
            
            return JsonResponse({'success': False, 'error': f'Unknown action: {action}'}, status=400)

        except Exception as e:
            print(f"Критична помилка в методі post: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)