# Generated by Django 5.1.6 on 2025-02-05 23:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_paper_quartile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paper',
            name='quartile',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
