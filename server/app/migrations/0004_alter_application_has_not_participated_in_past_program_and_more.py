# Generated by Django 5.1.6 on 2025-02-05 22:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_alter_application_email_alter_application_first_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='has_not_participated_in_past_program',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='phd_is_from_foreign_institute',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
