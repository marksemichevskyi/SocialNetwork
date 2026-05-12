from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.
class FriendsView(TemplateView):
    template_name = "friends.html"