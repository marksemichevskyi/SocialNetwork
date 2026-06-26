from django.utils import timezone 
from user_app.models import Friendship
from django.db.models import Q

def add_friend_request(user, other_user):
    Friendship.objects.get_or_create(from_user=user, to_user=other_user, defaults={'status': 'pending'})
    return {
        'remove': False,
        'text': 'Очікування'
    }

def accept_friend_request(user, other_user):
    friendship = Friendship.objects.filter(from_user=other_user, to_user=user).first()
    
    if not friendship:
        friendship = Friendship.objects.filter(from_user=user, to_user=other_user).first()
        
    if not friendship:
        friendship = Friendship.objects.create(
            from_user=other_user, 
            to_user=user, 
            status='pending'
        )
        
    if not friendship.created_at:
        friendship.created_at = timezone.now()

    friendship.status = 'accepted'
    friendship.save()
    
    return {
        'remove': True,
        'text': 'Успішно додано в друзі'
    }

def delete_friendship(user, other_user):
    friendship = Friendship.objects.filter(
        (Q(from_user=user) & Q(to_user=other_user)) | 
        (Q(from_user=other_user) & Q(to_user=user))
    ).first()
    
    if friendship:
        friendship.delete()
        return {'remove': True, 'success': True}
        
    return {'remove': False, 'error': 'Зв\'язок не знайдено'}

def ignore_friendship(user, other_user):
    friendship = Friendship.objects.filter(
        (Q(from_user=user) & Q(to_user=other_user)) | 
        (Q(from_user=other_user) & Q(to_user=user))
    ).first()
    
    if friendship:
        friendship.status = 'ignored'
        if not friendship.created_at:
            friendship.created_at = timezone.now()
        friendship.save()
    else:
        Friendship.objects.create(
            from_user=user,  
            to_user=other_user,   
            status='ignored',
            created_at=timezone.now()
        )
        
    return {
        'remove': True,
        'success': True
    }