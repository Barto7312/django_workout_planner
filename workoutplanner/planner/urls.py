from django.urls import path
from . import views

urlpatterns = [
    #home
    path('', views.main_menu, name='main_menu'),
    path('get_default_workout/', views.get_default_workout, name="get_default_workout"),
    path('update_workout_time/<int:workout_id>/', views.update_workout_time, name="update_workout_time"),
    path('update_weight/', views.update_weight, name="update_weight"),
    path('move_to_next_day/<int:workout_id>/', views.move_to_next_day, name="move_to_next_day"),
    
    #library
    path('excercise-list', views.library, name='library'),
    path('exercise/<int:exercise_id>/details/', views.exercise_details, name='exercise_details'),

    #creator
    path('workout-creator', views.workoutCreator, name='workout-creator'),

    path('get_workouts/', views.get_workouts, name='get_workouts'),
    path('update_workout/<int:workout_id>/', views.update_workout, name='update_workout'),
    path('delete_workout/<int:workout_id>/', views.delete_workout, name='delete_workout'),
    path('create_workout/', views.create_workout, name="create_workout"),
    path('set_default_workout/', views.set_default_workout, name="set_default_workout"),

    path('fetch_days/<int:workout_id>/', views.get_days, name="get_days"),
    path('create_day/', views.create_day, name="create_day"),
    path('delete_day/<int:day_id>/', views.delete_day, name="delete_day"),

    path('fetch_exercises/<int:day_id>/', views.fetch_exercises, name="get_exercises"),
    path('update_exercises/<int:day_id>/', views.update_exercises, name='update_exercises')

]