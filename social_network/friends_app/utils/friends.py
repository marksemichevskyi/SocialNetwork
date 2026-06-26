from user_app.models import User
from user_app.models import Friendship
def get_friends_by_section(current_user, section):
    if section == "requests":
        active_requests = Friendship.objects.filter(to_user=current_user, status='pending')
        return [request.from_user for request in active_requests]

    elif section == "friends":
        friendships = Friendship.objects.filter(status='accepted').filter(
            from_user=current_user) | Friendship.objects.filter(status='accepted').filter(to_user=current_user)
        
        friends_list = []
        for f in friendships:
            if f.from_user == current_user:
                friends_list.append(f.to_user)
            else:
                friends_list.append(f.from_user)
        return friends_list


    
    elif section == 'recommendations':
        send_busy_user_ids = list(current_user.send_friendship.values_list('to_user_id', flat = True))
        received_busy_user_ids = list(current_user.received_friendship.values_list('from_user_id', flat = True))
        
        busy_ids = send_busy_user_ids + received_busy_user_ids + [current_user.id]
        return User.objects.exclude(id__in = busy_ids)
    