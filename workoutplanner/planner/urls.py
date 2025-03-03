from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_menu, name='main_menu'),
    path('workout-creator', views.workoutCreator, name='workout-creator'),
    path('statistics', views.statistics, name='statistics'),
    path('excercise-list', views.library, name='library'),
    path('exercise/<int:exercise_id>/details/', views.exercise_details, name='exercise_details'),
]