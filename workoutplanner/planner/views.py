from django.shortcuts import render
from django.http import HttpResponse
from .models import Exercise, Category, MuscleGroup
from django.http import JsonResponse

# Create your views here.
def main_menu(request):
    return render(request, 'home.html')

def workoutCreator(request):
    return render(request, 'workout_creator.html')

def profilePage(request):
    return render(request, 'profile_page.html')

def statistics(request):
    return render(request, 'statistics.html')


def library(request):
    categories = Category.objects.prefetch_related('category_exercises').all()  

    context = {
        'categories': categories
    }
    return render(request, 'library.html', context)

def exercise_details(request, exercise_id):
    
    try:
        exercise = Exercise.objects.get(id=exercise_id)
    except Exercise.DoesNotExist:
        return JsonResponse({'error': 'Exercise not found'}, status=404)

    
    exercise_data = {
        'name': exercise.name,
        'description': exercise.description,
        'muscles': [muscle.name for muscle in exercise.muscle_groups.all()],  
        'video_url': exercise.video.url if exercise.video else None,
    }

    return JsonResponse(exercise_data)
