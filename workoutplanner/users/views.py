from django.shortcuts import redirect, render
from .forms import CustomUserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.conf import settings

User = settings.AUTH_USER_MODEL

def loginUser(request):
    page='login'

    if request.user.is_authenticated:
        return redirect('/')
    
    if request.method == "POST":
        username = request.POST.get('username').lower()
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            messages.error(request, "Invalid username or password")
        
        return redirect('login')

    context = {'page': page, 'hide_nav': True}

    return render(request, 'login_register.html', context)

def registerUser(request):
    if request.user.is_authenticated:
        return redirect('/')

    form = CustomUserCreationForm()
    
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request, user)
            return redirect('/')
        else:
            for field, errors in form.errors.items():
                field_name = "Password" if field == "password1" else field.capitalize()
                if field != "password2": 
                    for error in errors:
                        messages.error(request, f"{field_name}: {error}")

    context = {'form': form, 'hide_nav': True}
    return render(request, 'login_register.html', context)

def logoutUser(request):
    logout(request)
    return redirect('login')