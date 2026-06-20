from django import template
from chat_app.models import Message  # Імпортуйте модель Message, а не Chat

register = template.Library()

@register.simple_tag
def get_unreaded_messages(user):
    if not user.is_authenticated:
        return 0
        
    # Рахуємо повідомлення прямо з таблиці Message

    return Message.objects.filter(
        chat__users=user
    ).exclude(
        readers=user
    ).exclude(
        sender=user
    ).distinct().count()