from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_menu, name='main_menu'),
    path('workout-creator', views.workoutCreator, name='workout-creator'),
    path('profile', views.profilePage, name='profile-page'),
    path('statistics', views.statistics, name='statistics'),
    path('excercise-list', views.library, name='library'),
    path('exercise/<int:exercise_id>/details/', views.exercise_details, name='exercise_details'),
    path('workouts/user/', views.get_user_workouts, name='get_user_workouts'),
    path('workout/<int:workout_id>/details/', views.get_workout_details, name='get_workout_details'),

]