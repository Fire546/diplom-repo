from django.shortcuts import render
from django.db.models import F
from rest_framework.response import Response
from django.shortcuts import render
from django.db.utils import IntegrityError
from django.http import JsonResponse
from rest_framework.views import APIView
from gsmtickets.settings import SECRET_KEY
from .models import User, Organisation, Tickets, AssignedTickets, UsingTicketsData, UsedQRs
from users.utils import authrequired
from hashlib import md5
import jwt
from datetime import datetime, timedelta
from users.utils import log_api_request



class TicketsAPI(APIView):
    @log_api_request
    @authrequired(['admin', 'client_manager'])
    def post(self, request, user):
        data = request.data
        gsm = data.get('gsm')
        quantity = int(data.get('quantity'))
        tickets = Tickets.objects.create(gsm=gsm, quantity=quantity, organisation=user.organisation)
        return Response({
            'success': f'Заявка успешно создана: {tickets.gsm}:{tickets.quantity}',
        })
    @log_api_request
    @authrequired(['admin', 'client_manager',])
    def get(self, request, user):
        tickets = Tickets.objects.filter(organisation = user.organisation)
        data = [[x.gsm, x.quantity, x.used_quantity, x.order_time, x.type, x.id]  for x in tickets]
        return Response({
            'tickets': data
        })
    


class ApproveTicketsAPI(APIView):
    @log_api_request
    @authrequired(['manager', 'admin'])
    def post(self, request, user):
        data = request.data
        tickets = Tickets.objects.get(id = data.get('tickets_id'))
        tickets.type = 'approved'
        tickets.save()
        return Response({'success':'Заявка одобрена', 'data': f'{tickets.id}:{tickets.gsm}:{tickets.quantity}:{tickets.organisation}'})

    



class AssignedTicketsAPI(APIView):
    @log_api_request
    @authrequired(['admin', 'client_manager',])
    def post(self, request, user):
        data = request.data
        tickets = Tickets.objects.get(id = data.get('tickets_id'))
        free_tickets = tickets.quantity - tickets.used_quantity
        if free_tickets == 0:
            return Response({'error': 'заявка уже полностью распределена'})
        quantity = int(data.get('quantity'))
        if quantity > free_tickets:
            return Response({'error': 'превышено количество доступных талонов'})
        driver = User.objects.get(id = data.get('user_id'))
        assigned = AssignedTickets.objects.create(user=driver, tickets = tickets, quantity=quantity)
        tickets.used_quantity += quantity
        tickets.save()
        return Response({'success': f'Талоны успешно привязаны к пользователю: {driver}'})
    

class CheckDriversTicketsAPI(APIView):
    @log_api_request
    @authrequired(['admin', 'cassier'])
    def post(self,request, user):
        data = request.data
        gsm = data.get('gsm')
        quantity = data.get('quantity')
        token = data.get('token')
        qr_id = data.get('qr_id')
        try:
            UsedQRs.objects.create(qr_id=qr_id)
        except:
            return Response({
            'error':'Данный QR уже использовался'
        }) 
        driver = User.objects.get(id = jwt.decode(token, algorithms='HS256', key=SECRET_KEY).get('user_id'))
        assigned_tickets = AssignedTickets.objects.filter(user=driver, quantity__gt = F('used_quantity'))
        available = sum([(x.quantity - x.used_quantity) for x in assigned_tickets if x.tickets.gsm == gsm])
        if available >= int(quantity):
            return Response({
            'success':'Все в порядке', 'username': str(driver),
            'quantity': quantity, 'gsm': gsm,
        })
        return Response({
            'error':'Что-то не так'
        }) 



class UsingTicketsAPI(APIView):
    @log_api_request
    @authrequired(['cassier', 'admin',])
    def post(self,request, user):
        data = request.data
        quantity = int(data.get('quantity'))
        gsm = data.get('gsm')
        token = data.get('token')
        driver = User.objects.get(id = jwt.decode(token, algorithms='HS256', key=SECRET_KEY).get('user_id'))
        assigned_tickets = AssignedTickets.objects.filter(user=driver, quantity__gt = F('used_quantity'), tickets__gsm = gsm,).order_by('assign_time')
        # Вычитаем запрошенное количество с имеющегося в распоряжении водителя
        for i in assigned_tickets:
            if quantity <= (i.quantity - i.used_quantity):
                i.used_quantity += quantity
                i.save()
                break
            else:
                quantity -= (i.quantity - i.used_quantity)
                i.used_quantity = i.quantity
                i.save()

        UsingTicketsData.objects.create(user=driver, quantity=quantity, gsm=gsm)

        return Response({
            'success':'Операция прошла успешно!'
        })
    @log_api_request
    @authrequired(['admin', 'driver'])
    def get(self, request, user):
        assigned_tickets = AssignedTickets.objects.filter(user=user, quantity__gt = F('used_quantity'))
        ai92 = sum([(x.quantity - x.used_quantity) for x in assigned_tickets if x.tickets.gsm == '92'])
        ai95 = sum([(x.quantity - x.used_quantity) for x in assigned_tickets if x.tickets.gsm == '95'])
        dt = sum([(x.quantity - x.used_quantity) for x in assigned_tickets if x.tickets.gsm == 'dt'])
        return Response({
            'user': str(user), '92': ai92, '95': ai95, 'dt': dt,
        })

def del_tickets(request):
    tickets = Tickets.objects.all().delete()
    assigned_tickets = AssignedTickets.objects.all().delete()
    return JsonResponse({'success': 'tickets deleted'})


class DriversInfoApi(APIView):
    @log_api_request
    @authrequired(['admin', 'client_manager',])
    def get(self, request, user):
        assign_tickets = AssignedTickets.objects.filter(tickets__organisation = user.organisation, quantity__gt = F('used_quantity'))
        users = User.objects.filter(organisation=user.organisation, type='driver')
        data = {}
        for user in users:
            data[str(user)] = {}

            for tickets in assign_tickets:
                if tickets.user == user:
                    fuel_type = tickets.tickets.gsm
                    available = tickets.quantity - tickets.used_quantity

                    if fuel_type in data[str(user)]:
                        data[str(user)][fuel_type] += available
                    else:
                        data[str(user)][fuel_type] = available

        return Response({
            'data': data,
        })
    
class CassierOperationsAPI(APIView):
    @log_api_request
    @authrequired(['admin', 'cassier'])
    def get(self, request, user):
        today = datetime.today().date()  
        start = datetime.combine(today, datetime.min.time())  
        end = datetime.combine(today, datetime.max.time())   

        info = UsingTicketsData.objects.filter(used_time__range=(start, end))

        data = [(str(x.user), x.gsm, x.quantity, x.used_time) for x in info]
        return Response({
            'data': data,
        })
    
class UsedTicketsInfoAPI(APIView):
    @log_api_request
    @authrequired(['admin', 'client_manager', 'manager'])
    def get(self, request, user):
        start_date_str = request.query_params.get("start")
        end_date_str = request.query_params.get("end")

        if not start_date_str or not end_date_str:
            return Response({"error": "Нужно указать даты начала и конца"}, status=400)

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        except ValueError:
            return Response({"error": "Неверный формат даты (ожидается YYYY-MM-DD)"}, status=400)

        if (end_date - start_date).days > 93:
            return Response({"error": "Интервал не может быть больше 3 месяцев"}, status=400)

        if user.type == 'client_manager':
            manager = user
            info = UsingTicketsData.objects.filter(
                user__organisation=manager.organisation,
                used_time__range=(start_date, end_date + timedelta(days=1))
            )
        else:
            info = UsingTicketsData.objects.filter(
                used_time__range=(start_date, end_date + timedelta(days=1))
            )

        data = [(str(x.user), x.gsm, x.quantity, x.used_time) for x in info]
        return Response({"data": data})
    

class GetAllTicketsAPI(APIView):
    @log_api_request
    @authrequired(['manager', 'admin'])
    def get(self, request, user):
        tickets = Tickets.objects.all()
        data = [[x.organisation.name, x.gsm, x.quantity, x.used_quantity, x.order_time, x.type, x.id]  for x in tickets]
        return Response({
            'tickets': data
        })
    

    
class GetAllDriversInfoAPI(APIView):
    @log_api_request
    @authrequired(['manager', 'admin'])
    def get(self,request, user):
        assign_tickets = AssignedTickets.objects.filter(quantity__gt = F('used_quantity'))
        users = User.objects.filter(type='driver')
        organisations = Organisation.objects.all()
        data = {}
        for organisation in organisations:
            data[str(organisation)] = {}
            for user in users:
                if user.organisation == organisation:

                    data[str(organisation)][str(user)] = {}

                    for tickets in assign_tickets:
                        if tickets.user == user:
                            fuel_type = tickets.tickets.gsm
                            available = tickets.quantity - tickets.used_quantity

                            if fuel_type in data[str(organisation)][str(user)]:
                                data[str(organisation)][str(user)][fuel_type] += available
                            else:
                                data[str(organisation)][str(user)][fuel_type] = available
        return Response({
            'data': data,
        })