from django.shortcuts import render, get_object_or_404, redirect
import json
from .models import Exercise, Category, WorkoutPlan, WorkoutDay, WorkoutExercise
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect


################# PAGES ##################

def main_menu(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'home.html')

def workoutCreator(request):

    if not request.user.is_authenticated:
        return redirect('login')
       
    categories = Category.objects.prefetch_related('category_exercises').all() 

    context = {
        'categories': categories
    }
    return render(request, 'workout_creator.html', context)

def library(request):

    if not request.user.is_authenticated:
        return redirect('login')
    
    categories = Category.objects.prefetch_related('category_exercises').all()  

    context = {
        'categories': categories
    }
    return render(request, 'library.html', context)


################# LIBRARY ##################

#library
@login_required
def exercise_details(request, exercise_id):
    
    exercise = get_object_or_404(Exercise, id=exercise_id)

    exercise_data = {
        'name': exercise.name,
        'description': exercise.description,
        'image_url': exercise.image.url if exercise.image else None,
    }
    return JsonResponse(exercise_data)


################# CREATOR ##################

#workouts
@login_required
def get_workouts(request):
    workouts = WorkoutPlan.objects.filter(owner=request.user)
    workouts_data = list(workouts.values('id', 'name', 'restDays', 'startDate')) #values_list
    return JsonResponse(workouts_data, safe=False)

@csrf_protect
@login_required
def update_workout_time(request, workout_id):
    workout = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            workout.startDate = data.get('startDate', workout.startDate)
            workout.currentDay = data.get('currentDay', workout.currentDay)
            workout.save()
            return JsonResponse({'message': 'Workout updated successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        
@csrf_protect
@login_required
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

@csrf_protect
@login_required
def delete_workout(request, workout_id):
    """Delete a workout."""
    workout = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)

    if request.method == 'DELETE':
        workout.delete()
        return JsonResponse({'message': 'Workout deleted successfully'})

@csrf_protect
@login_required
def create_workout(request):
    if request.method == "POST":
        data = json.loads(request.body)
        workout = WorkoutPlan.objects.create(
            name=data["name"],
            restDays=data["restDays"],
            startDate=data["startDate"],
            owner=request.user
        )

        if request.user.selected_workout_plan is None:
            request.user.selected_workout_plan = workout
            request.user.save(update_fields=['selected_workout_plan'])        

        return JsonResponse({"message": "Workout created successfully", "id": workout.id})

#days
@login_required
def get_days(request, workout_id):

    workout_plan = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)
    workout_days = workout_plan.days.all().values('id', 'day_order')

    return JsonResponse(list(workout_days), safe=False)

@csrf_protect
@login_required
def create_day(request):
    if request.method == "POST":
        data = json.loads(request.body)
        workout_plan = get_object_or_404(WorkoutPlan, id=data["workout_plan_id"])
        day = WorkoutDay.objects.create(
            workout_plan=workout_plan
        )

        if workout_plan.days.count() == 1:  
            workout_plan.currentDay = day
            workout_plan.save(update_fields=['currentDay'])      

        return JsonResponse({"message": "Day created successfully", "id": day.id})

@csrf_protect
@login_required
def delete_day(request, day_id):
    if request.method == 'DELETE':
        workout_day = get_object_or_404(WorkoutDay, id=day_id)
        
        workout_plan = workout_day.workout_plan
        
        if workout_plan.owner != request.user:
            return JsonResponse({"error": "You are not authorized to delete this day."}, status=403)
        
        workout_day.delete()
        return JsonResponse({"message": "Day deleted successfully."})

    return JsonResponse({"error": "Invalid request"}, status=400)


@login_required
def fetch_exercises(request, day_id):
    workout_day = get_object_or_404(WorkoutDay, id=day_id, workout_plan__owner=request.user)
    exercises = workout_day.exercises.all().values(
        "id", "exercise", "exercise__name", "weight", "sets", "reps", "rest_seconds", "exercise_order"
    )
    return JsonResponse(list(exercises), safe=False)


def fetch_all_exercises(request):
    exercises = Exercise.objects.all().values("id", "name")
    return JsonResponse(list(exercises), safe=False)

@csrf_protect
def update_exercises(request, day_id):
    if request.method == "POST":
        data = json.loads(request.body)
        day = WorkoutDay.objects.get(id=day_id)

        for item in data:
            if item["action"] == "deleted":
                WorkoutExercise.objects.filter(id=item["id"]).delete()
            elif item["action"] == "updated":
                exercise = WorkoutExercise.objects.get(id=item["id"])
                exercise.weight = item["weight"]
                exercise.sets = item["sets"]
                exercise.reps = item["reps"]
                exercise.rest_seconds = item["rest_seconds"]
                exercise.save()
            elif item["action"] == "added":
                WorkoutExercise.objects.create(
                    exercise=Exercise.objects.get(id=item["exercise_id"]),
                    day=day,
                    weight=item["weight"],
                    sets=item["sets"],
                    reps=item["reps"],
                    rest_seconds=item["rest_seconds"],
                    exercise_order=item["exercise_order"]
                )

        return JsonResponse({"success": True, "day_order": day.day_order})
    
@login_required
@csrf_protect 
def set_default_workout(request):
    if request.method == "POST":
        data = json.loads(request.body)
        workout_id = data.get("workout_id")
        
        workout = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)

        request.user.selected_workout_plan = workout
        request.user.save()

        return JsonResponse({"message": f"Default workout changed to {workout.name}."}, status=200)
        

################# HOME ##################

@login_required
def get_default_workout(request):
    
    workout_plan = request.user.selected_workout_plan

    if not workout_plan:
        return JsonResponse({"message": "No workouts! <br> Please create a workout in the workout creator."})

    current_day = workout_plan.currentDay

    exercises_for_today = WorkoutExercise.objects.filter(day=current_day).order_by('exercise_order')

    exercises_data = []
    for exercise in exercises_for_today:
        exercises_data.append({
            'exercise_name': exercise.exercise.name,
            'weight': exercise.weight,
            'sets': exercise.sets,
            'reps': exercise.reps,
            'rest_seconds': exercise.rest_seconds,
            'exercise_order': exercise.exercise_order,
            'exercise_description': exercise.exercise.description,
            'exercise_id': exercise.id,
            'image_url': exercise.exercise.image.url if exercise.exercise.image else None,
        })

    response_data = {
        'workout_plan': {
            'id': workout_plan.id,
            'name': workout_plan.name,
            'startDate': workout_plan.startDate.strftime('%Y-%m-%d'),
            'rest_days': workout_plan.restDays,
            'current_day': current_day.day_order
        },
        'exercises_for_today': exercises_data
    }
    return JsonResponse(response_data)

@csrf_protect 
@login_required
def update_weight(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            exercise_id = data.get("exercise_id")
            new_weight = data.get("new_weight")

            workout_exercise = WorkoutExercise.objects.get(id=exercise_id)
            
            # Sprawdzenie, czy użytkownik jest właścicielem planu treningowego
            if workout_exercise.day.workout_plan.owner != request.user:
                return JsonResponse({"error": "Permission denied"}, status=403)
            
            workout_exercise.weight = new_weight
            workout_exercise.save()
            
            return JsonResponse({"success": True, "new_weight": workout_exercise.weight})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})

@csrf_protect  
@login_required
def move_to_next_day(request, workout_id): 
    workout_plan = get_object_or_404(WorkoutPlan, id=workout_id, owner=request.user)

    next_day = WorkoutDay.objects.filter(
        workout_plan=workout_plan,
        day_order__gt=workout_plan.currentDay.day_order
    ).order_by('day_order').first()

    if next_day:
        workout_plan.currentDay = next_day
        workout_plan.save()
        return JsonResponse({"message": f"Moved to Day {next_day.day_order}."})    

    first_day = WorkoutDay.objects.filter(
        workout_plan=workout_plan
    ).order_by('day_order').first()

    if first_day:
        workout_plan.currentDay = first_day
        workout_plan.save()
        return JsonResponse({"message": f"Reset to Day {first_day.day_order}."})

    return JsonResponse({"message": "No workout days available."}, status=400)