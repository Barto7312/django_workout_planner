from django.db import models
from django.contrib.auth.models import User  

class MuscleGroup(models.Model):
    name = models.CharField(max_length=200, unique=True)
    
    def __str__(self):
        return self.name   
    
class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name 

class Exercise(models.Model):
    name = models.CharField(max_length=200, unique=True)
    icon = models.ImageField(blank=True, null=True)
    video = models.FileField(blank=True, null=True)
    description = models.TextField(max_length=1000, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="category_exercises")
    muscle_groups = models.ManyToManyField(MuscleGroup, related_name="muscle_exercises")

    def __str__(self):
        return self.name    

class WorkoutPlan(models.Model): 
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    restDays = models.IntegerField()
    startDate = models.DateField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')

    def __str__(self):
        return self.name
    
class WorkoutDay(models.Model):
    workout_plan = models.ForeignKey(WorkoutPlan, related_name='days', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., "Day 1", "Day 2"
    day_order = models.PositiveIntegerField()  # To sort days if needed (e.g., 1 for Day 1, 2 for Day 2)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f'{self.workout_plan.name} - {self.name}'

    class Meta:
        ordering = ['day_order']  # To ensure the days are ordered correctly in the workout

class WorkoutExercise(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    day = models.ForeignKey(WorkoutDay, related_name='exercises', on_delete=models.CASCADE)
    weight = models.FloatField()
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    rest_seconds = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.exercise.name} - {self.sets} sets of {self.reps} reps with {self.rest_seconds} seconds of rest"
