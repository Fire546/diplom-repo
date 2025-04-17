from django.db import models
from uuid import uuid4

class Organisation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)

    name = models.CharField(max_length=128, unique=True)
    bin = models.CharField(max_length=12, unique=True)

    def __str__(self):
        return self.name

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)

    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)

    password = models.CharField(max_length=64)

    email = models.EmailField(unique=True)

    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, null=True)

    type = models.CharField(max_length=16, default='client')

    def __str__(self):
        return self.first_name + ' ' + self.last_name

    



