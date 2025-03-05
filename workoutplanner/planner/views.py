from django.shortcuts import render
from django.http import HttpResponse
from .models import Exercise, Category, WorkoutPlan, WorkoutDay
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User


# Create your views here.
def main_menu(request):
    return render(request, 'home.html')

def workoutCreator(request):
    workouts = WorkoutPlan.objects.filter(owner=request.user)

    context = {
        'workouts': workouts
    }

    return render(request, 'workout_creator.html', context)

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

@login_required
def get_user_workouts(request):
    workouts = WorkoutPlan.objects.filter(owner=request.user).values('id', 'name')
    return JsonResponse(list(workouts), safe=False)

@login_required
def get_workout_details(request, workout_id):
    try:
        workout = WorkoutPlan.objects.get(id=workout_id)
    except WorkoutPlan.DoesNotExist:
        return JsonResponse({'error': 'Workout not found'}, status=404)
    
    workout_data = {
        'name': workout.name,
        'start_date': workout.startDate,
        'rest_days': workout.restDays,
        'workout_days': workout.days.values('id', 'name', 'day_order')
    }
    return JsonResponse(workout_data)
