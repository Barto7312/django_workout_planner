from django.shortcuts import redirect, render
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User

def loginUser(request):
    page='login'

    if request.user.is_authenticated:
        return redirect('/')
    
    if request.method == "POST":
        username = request.POST.get('username').lower()
        password = request.POST.get('password')

        try:
            user = User.objects.get(username=username)
        except:
            messages.error(request, 'User does not exist')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            messages.error(request, "Username OR password doesn't exist")
        
        return redirect('login')

    context = {'page': page, 'hide_nav': True}

    return render(request, 'login_register.html', context)

def registerUser(request):
    
    if request.user.is_authenticated:
        return redirect('/')      

    form = UserCreationForm()

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request, user)
            return redirect ('/')
        else:
            messages.error(request, "Error occured during registration")

            return redirect('register')

    context = {'form': form,'hide_nav': True}
    return render(request, 'login_register.html', context)

def logoutUser(request):
    logout(request)
    return redirect('login')