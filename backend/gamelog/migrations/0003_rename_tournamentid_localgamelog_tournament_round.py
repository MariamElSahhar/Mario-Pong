# Generated by Django 5.1.1 on 2025-01-31 13:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("gamelog", "0002_remove_localgamelog_game_type_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="localgamelog",
            old_name="tournamentID",
            new_name="tournament_round",
        ),
    ]
