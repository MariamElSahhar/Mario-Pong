# Generated by Django 5.1.1 on 2024-11-19 16:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0009_alter_customuser_last_seen"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="game_id",
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
