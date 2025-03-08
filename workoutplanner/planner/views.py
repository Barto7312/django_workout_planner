from django.shortcuts import render, get_object_or_404
import json
from django.http import HttpResponse
from .models import Exercise, Category, WorkoutPlan, WorkoutDay, WorkoutExercise
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
def main_menu(request):
    return render(request, 'home.html')

def workoutCreator(request):
    categories = Category.objects.prefetch_related('category_exercises').all()  

    context = {
        'categories': categories
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
    workout_days = workout_plan.days.all().values('id', 'name', 'day_order')

    return JsonResponse(list(workout_days), safe=False)

@csrf_exempt
@login_required
def delete_day(request, day_id):
    if request.method == 'DELETE':
        # Get the WorkoutDay object by day_id
        workout_day = get_object_or_404(WorkoutDay, id=day_id)
        
        # Get the associated WorkoutPlan
        workout_plan = workout_day.workout_plan
        
        # Check if the request's user is the owner of the workout plan
        if workout_plan.owner != request.user:
            return JsonResponse({"error": "You are not authorized to delete this day."}, status=403)
        
        # If the user is the owner, delete the day
        workout_day.delete()
        return JsonResponse({"message": "Day deleted successfully."})

    return JsonResponse({"error": "Invalid request"}, status=400)




@login_required
def get_exercises_for_day(request, day_id):
    workout_day = get_object_or_404(WorkoutDay, id=day_id, workout_plan__owner=request.user)
    exercises = workout_day.exercises.all().values(
        "id", "exercise__name", "weight", "sets", "reps", "rest_seconds", "exercise_order"
    )
    return JsonResponse(list(exercises), safe=False)

def fetch_all_exercises(request):
    exercises = Exercise.objects.all().values("id", "name")
    return JsonResponse(list(exercises), safe=False)

@csrf_exempt
def add_exercise_to_day(request, day_id):
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            day = WorkoutDay.objects.get(id=day_id)
            exercise = Exercise.objects.get(id=data["exercise_id"])

            new_exercise = WorkoutExercise.objects.create(
                exercise=exercise,
                day=day,
                weight=data["weight"],
                sets=data["sets"],
                reps=data["reps"],
                rest_seconds=data["rest_seconds"],
                exercise_order=WorkoutExercise.objects.filter(day=day).count() + 1
            )

            return JsonResponse({"success": True, "exercise_id": new_exercise.id})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
        