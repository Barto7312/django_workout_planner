from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_menu, name='main_menu'),
    path('workout-creator', views.workoutCreator, name='workout-creator'),

    path('excercise-list', views.library, name='library'),
    path('exercise/<int:exercise_id>/details/', views.exercise_details, name='exercise_details'),

    path('get_workouts/', views.get_workouts, name='get_workouts'),
    path('update_workout/<int:workout_id>/', views.update_workout, name='update_workout'),
    path('delete_workout/<int:workout_id>/', views.delete_workout, name='delete_workout'),
    path('create_workout/', views.create_workout, name="create_workout"),

    path('fetch_days/<int:workout_id>/', views.get_days, name="get_days"),
    path('create_day/', views.create_day, name="create_day"),
    path('delete_day/<int:day_id>/', views.delete_day, name="delete_day"),

    path('fetch_exercises/<int:day_id>/', views.get_exercises_for_day, name="get_exercises"),

    path('remove_exercise/<int:exercise_id>/', views.remove_exercise, name="remove_exercise"),
    path('update_exercises/<int:day_id>/', views.update_exercises, name='update_exercises'),

    path('get_workout/<int:workout_id>/', views.get_workout, name="get_workout"),
    path('update_workout_time/<int:workout_id>/', views.update_workout_time, name="update_workout_time"),

]