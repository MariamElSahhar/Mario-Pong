# Generated by Django 5.1.1 on 2025-03-09 17:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0013_merge_20241222_0621"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="customuser",
            name="is_email_verified",
        ),
    ]
