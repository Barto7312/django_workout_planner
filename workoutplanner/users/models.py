from django.db import models
from django.contrib.auth.models import User  

# class CustomUser(AbstractUser):
#     current_workout_plan = models.ForeignKey(
#         'WorkoutPlan', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True, 
#         related_name="selected_by"
#     )