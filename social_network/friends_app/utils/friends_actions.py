from django.utils import timezone 
from ..models import Friendship
from django.db.models import Q

def add_friend_request(user, other_user):
    Friendship.objects.get_or_create(from_user=user, to_user=other_user)
    return {
        'remove': False,
        'text': 'Очікування'
    }
  

def accept_friend_request(user, other_user):
    friendship = Friendship.objects.filter(
        (Q(from_user=user) & Q(to_user=other_user)) | 
        (Q(from_user=other_user) & Q(to_user=user))
    ).first()
    
    if not friendship:
        print("=== СТВОРЕННЯ НОВОГО ЗАПИСУ ===")
        friendship = Friendship.objects.create(
            from_user=other_user, 
            to_user=user, 
            status='pending',
            created_at=timezone.now()
        )
        
    if not friendship.created_at:
        friendship.created_at = timezone.now()

    friendship.status = 'accepted'
    friendship.save()
    
    print(f"=== БАЗА ОНОВЛЕНА: ID {friendship.id} тепер {friendship.status} ===")
    
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
        
    return {
        'remove': True
    }

def ignore_friendship(user, other_user):

    friendship = Friendship.objects.filter(from_user=other_user, to_user=user).first()
    
    if friendship:
        friendship.status = 'ignored'
        friendship.save()
    else:
        Friendship.objects.get_or_create(from_user=other_user, to_user=user, defaults={'status': 'ignored'})
        
    return {
        'remove': True
    }