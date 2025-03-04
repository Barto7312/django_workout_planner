# Generated by Django 5.1.6 on 2025-03-01 22:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=200, unique=True)),
            ],
        ),
        migrations.AlterField(
            model_name='excercise',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.category'),
        ),
    ]
