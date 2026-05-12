from django.shortcuts import render, redirect

def home_redirect(request):
    if request.user.is_authenticated:
        return redirect('/main/')
    return redirect('/user/auth/')
