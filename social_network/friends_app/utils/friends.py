from user_app.models import User

def get_friends_by_section(current_user: User, section):
    if section == 'friends':
        send_friends_id = list(current_user.send_friendship.filter(status = 'accepted').values_list('to_user_id', flat = True))
        recieved_friends_id = list(current_user.received_friendship.filter(status = 'accepted').values_list('from_user_id', flat = True))
        
        return User.objects.filter(id__in = send_friends_id + recieved_friends_id)
    
    elif section =='requests':
        return User.objects.filter(send_friendship__status = 'pending', send_friendship__to_user = current_user)
    
    elif section == 'recommendations':
        # Id Користувачів, яким відправляли запит
        send_busy_user_ids = list(current_user.send_friendship.values_list('to_user_id', flat = True))
        # Id Користувачів, від яких отримували запит
        received_busy_user_ids = list(current_user.received_friendship.values_list('from_user_id', flat = True))
        
        busy_ids = send_busy_user_ids + received_busy_user_ids + [current_user.id]

        # Модель.objects.exclude - отримує всіх за винятком вказаних
        # список_моделі.values_list("поле", flat = True) - замість списку елементів, повертає список значень поля (flat робить єдиним списком)

        return User.objects.exclude(id__in = busy_ids)
    