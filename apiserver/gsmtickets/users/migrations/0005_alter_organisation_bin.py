# Generated by Django 5.1.7 on 2025-03-19 15:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_organisation_bin_alter_organisation_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organisation',
            name='bin',
            field=models.CharField(max_length=12, unique=True),
        ),
    ]
