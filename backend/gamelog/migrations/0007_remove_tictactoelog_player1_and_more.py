# Generated by Django 5.1.1 on 2025-03-05 18:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gamelog", "0006_rename_loserid_tictactoelog_player1_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="tictactoelog",
            name="player1",
        ),
        migrations.RemoveField(
            model_name="tictactoelog",
            name="player2",
        ),
        migrations.AddField(
            model_name="tictactoelog",
            name="player1_id",
            field=models.PositiveIntegerField(default=None),
        ),
        migrations.AddField(
            model_name="tictactoelog",
            name="player2_id",
            field=models.PositiveIntegerField(default=None),
        ),
    ]
