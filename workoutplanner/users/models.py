from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    selected_workout_plan = models.ForeignKey(
        'planner.WorkoutPlan', on_delete=models.SET_NULL, null=True, blank=True
    )
    