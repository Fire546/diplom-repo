# Generated by Django 5.1.3 on 2025-03-27 10:02

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0008_alter_assignedtickets_used_quantity_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignedtickets',
            name='assign_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 3, 27, 15, 2, 50, 102429)),
        ),
        migrations.AlterField(
            model_name='tickets',
            name='order_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 3, 27, 15, 2, 50, 102429)),
        ),
    ]
