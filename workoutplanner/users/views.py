from django.shortcuts import redirect, render
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout

# Create your views here.
def loginUser(request):
    return render(request, 'login_register.html')

def logoutUser(request):
    logout(request)
    return redirect('/')