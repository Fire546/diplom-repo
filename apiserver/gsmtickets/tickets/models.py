from django.db import models
from users.models import Organisation, User
from uuid import uuid4
from datetime import datetime

class Tickets(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)

    gsm = models.CharField(max_length=3)
    quantity = models.IntegerField()
    used_quantity = models.IntegerField(default=0)

    type = models.CharField(max_length=16, default='ordered')
    
    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE)

    order_time = models.DateTimeField(default=datetime.now())

class AssignedTickets(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)

    tickets = models.ForeignKey(Tickets, on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    quantity = models.IntegerField()
    used_quantity = models.IntegerField(default=0)

    assign_time = models.DateTimeField(default=datetime.now())



class UsingTicketsData(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    used_time = models.DateTimeField(default=datetime.now())

    gsm = models.CharField(max_length=3, null=True)

    quantity = models.IntegerField()


class UsedQRs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)

    qr_id = models.UUIDField(unique=True)




