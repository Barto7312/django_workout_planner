# Generated by Django 5.1.6 on 2025-03-02 09:51

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='MuscleGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='WorkoutDay',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('day_order', models.PositiveIntegerField()),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'ordering': ['day_order'],
            },
        ),
        migrations.CreateModel(
            name='Exercise',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
                ('icon', models.ImageField(blank=True, null=True, upload_to='')),
                ('video', models.FileField(blank=True, null=True, upload_to='')),
                ('description', models.TextField(blank=True, max_length=1000, null=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercises', to='planner.category')),
                ('muscle_groups', models.ManyToManyField(related_name='exercises', to='planner.musclegroup')),
            ],
        ),
        migrations.CreateModel(
            name='WorkoutExercise',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.FloatField()),
                ('sets', models.PositiveIntegerField()),
                ('reps', models.PositiveIntegerField()),
                ('rest_seconds', models.PositiveIntegerField()),
                ('day', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercises', to='planner.workoutday')),
                ('exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planner.exercise')),
            ],
        ),
        migrations.CreateModel(
            name='WorkoutPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('restDays', models.IntegerField()),
                ('startDate', models.DateField()),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workouts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='workoutday',
            name='workout_plan',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='days', to='planner.workoutplan'),
        ),
    ]
