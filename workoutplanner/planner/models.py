from django.db import models
from django.contrib.auth.models import User 
# from users.models import CustomUser

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
    currentDay = models.ForeignKey('WorkoutDay', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class WorkoutDay(models.Model):
    workout_plan = models.ForeignKey(WorkoutPlan, related_name='days', on_delete=models.CASCADE)
    day_order = models.PositiveIntegerField()  

    def save(self, *args, **kwargs):
        if self._state.adding:  
            last_day = WorkoutDay.objects.filter(workout_plan=self.workout_plan).order_by('-day_order').first()
            self.day_order = (last_day.day_order + 1) if last_day else 1  

        super().save(*args, **kwargs) 

    def delete(self, *args, **kwargs):
        current_order = self.day_order  
        super().delete(*args, **kwargs) 

        WorkoutDay.objects.filter(
            workout_plan=self.workout_plan,
            day_order__gt=current_order
        ).update(day_order=models.F('day_order') - 1)

    def __str__(self):
        return f'{self.workout_plan.name} - (Day {self.day_order})'

    class Meta:
        ordering = ['day_order']

class WorkoutExercise(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    day = models.ForeignKey(WorkoutDay, related_name='exercises', on_delete=models.CASCADE)
    weight = models.FloatField()
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    rest_seconds = models.PositiveIntegerField()
    exercise_order = models.PositiveIntegerField()

    class Meta:
        ordering = ['exercise_order']  

    def save(self, *args, **kwargs):
        if self._state.adding:  
            last_exercise = WorkoutExercise.objects.filter(day=self.day).order_by('-exercise_order').first()
            self.exercise_order = (last_exercise.exercise_order + 1) if last_exercise else 1  
        super().save(*args, **kwargs)  

    def delete(self, *args, **kwargs):
        current_order = self.exercise_order  #
        super().delete(*args, **kwargs)  

        
        WorkoutExercise.objects.filter(
            day=self.day,
            exercise_order__gt=current_order
        ).update(exercise_order=models.F('exercise_order') - 1)

    def __str__(self):
        return f"{self.exercise.name} - {self.sets} sets of {self.reps} reps with {self.rest_seconds} seconds of rest"
