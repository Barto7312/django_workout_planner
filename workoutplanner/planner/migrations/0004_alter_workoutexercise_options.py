# Generated by Django 5.1.6 on 2025-03-10 10:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0003_workoutexercise_exercise_order'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='workoutexercise',
            options={'ordering': ['exercise_order']},
        ),
    ]
