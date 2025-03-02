from django.contrib import admin

# Register your models here.
from .models import Exercise, WorkoutPlan, WorkoutDay, WorkoutExercise, MuscleGroup, Category
# Register your models here.
admin.site.register(Exercise)
admin.site.register(WorkoutPlan)
admin.site.register(WorkoutDay)
admin.site.register(WorkoutExercise)
admin.site.register(MuscleGroup)
admin.site.register(Category)