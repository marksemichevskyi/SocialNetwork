from ..models import Friendship

def add_friend_request(user, other_user):
    Friendship.objects.get_or_create(from_user = user, to_user = other_user)
    return {
        'remove': False,
        'text': 'Очікування'
    }

def accept_friend_request(user, other_user):
    friendship = Friendship.objects.filter(from_user = other_user, to_user = user).first()
    friendship.status = 'accepted'
    friendship.save()
    return {
        'remove': True
    }

def delete_friendship(user, other_user):
    friendship = Friendship.objects.filter(from_user = other_user, to_user = user).first()
    if not friendship:
        friendship = Friendship.objects.filter(from_user = user, to_user = other_user).first()
    if friendship:
        friendship.delete()
    return {
        'remove': True
    }

def ignore_friendship(user, other_user):
    friendship = Friendship.objects.get_or_create(from_user = user, to_user = other_user, defaults= {'status':'ignored'})
    return {
        'remove': True
    }