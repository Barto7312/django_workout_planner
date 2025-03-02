from django.shortcuts import render
from django.http import HttpResponse
from .models import Exercise, Category

# Create your views here.
def main_menu(request):
    return render(request, 'home.html')

def workoutCreator(request):
    return render(request, 'workout_creator.html')

def statistics(request):
    return render(request, 'statistics.html')


def library(request):
    

    categories = Category.objects.prefetch_related('category_exercises').all()  # Pobranie kategorii i ich ćwiczeń

    context = {
        'categories': categories
    }
    return render(request, 'library.html', context)
