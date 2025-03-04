# Generated by Django 5.1.6 on 2025-02-05 22:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_alter_application_scientific_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='first_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='last_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='phd_acquisition_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='work_experience',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='paper',
            name='country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='paper',
            name='journal_conf_title',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='paper',
            name='paper_title',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='paper',
            name='type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='paper',
            name='year',
            field=models.CharField(blank=True, max_length=4, null=True),
        ),
    ]
