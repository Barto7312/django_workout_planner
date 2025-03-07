from django.shortcuts import render, get_object_or_404
import json
from django.http import HttpResponse
from .models import Exercise, Category, WorkoutPlan, WorkoutDay
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt


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




# API

#library
def exercise_details(request, exercise_id):
    
    exercise = get_object_or_404(Exercise, id=exercise_id)

    exercise_data = {
        'name': exercise.name,
        'description': exercise.description,
        'muscles': [muscle.name for muscle in exercise.muscle_groups.all()],  
        'video_url': exercise.video.url if exercise.video else None,
    }
    return JsonResponse(exercise_data)


#creator
def get_workouts(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    workouts = WorkoutPlan.objects.filter(owner=request.user)
    workouts_data = list(workouts.values('id', 'name', 'restDays', 'startDate')) #values_list
    return JsonResponse(workouts_data, safe=False)

@csrf_exempt
def update_workout(request, workout_id):

    workout = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            workout.name = data.get('name', workout.name)
            workout.restDays = int(data.get('restDays', workout.restDays))
            workout.startDate = data.get('startDate', workout.startDate)
            workout.save()
            return JsonResponse({'message': 'Workout updated successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def delete_workout(request, workout_id):
    """Delete a workout."""
    workout = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)

    if request.method == 'DELETE':
        workout.delete()
        return JsonResponse({'message': 'Workout deleted successfully'})


@csrf_exempt
def create_workout(request):
    if request.method == "POST":
        data = json.loads(request.body)
        workout = WorkoutPlan.objects.create(
            name=data["name"],
            restDays=data["restDays"],
            startDate=data["startDate"],
            owner=request.user  # Assuming user authentication
        )
        return JsonResponse({"message": "Workout created successfully", "id": workout.id})

@login_required
def get_days(request, workout_id):

    workout_plan = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)
    workout_days = workout_plan.days.all().values('id', 'name', 'day_order', 'description')

    return JsonResponse(list(workout_days), safe=False)