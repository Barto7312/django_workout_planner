from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_menu, name='main_menu'),
    path('workout-creator', views.workoutCreator, name='workout-creator'),
    path('profile', views.profilePage, name='profile-page'),
    path('statistics', views.statistics, name='statistics'),
    path('excercise-list', views.library, name='library'),
    path('exercise/<int:exercise_id>/details/', views.exercise_details, name='exercise_details'),
    path('get_workouts/', views.get_workouts, name='get_workouts'),
    path('update_workout/<int:workout_id>/', views.update_workout, name='update_workout'),
    path('delete_workout/<int:workout_id>/', views.delete_workout, name='delete_workout'),
    path('create-workout/', views.create_workout, name="create_workout"),
]