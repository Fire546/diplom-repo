from rest_framework.response import Response
from django.shortcuts import render
from django.db.utils import IntegrityError
from django.http import JsonResponse
from rest_framework.views import APIView
from gsmtickets.settings import SECRET_KEY
from .models import User, Organisation
from tickets.models import Tickets, AssignedTickets
from .utils import UserRegBase, UserAuthBase, validation, authrequired
from hashlib import md5
import jwt
import datetime

class RegAuth(APIView):
    @validation(UserRegBase)
    def post(self, request):
        data = request.data
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        password = data.get('password')
        password = md5(password.encode()).hexdigest()
        email = data.get('email')
        if not first_name or not last_name or not password or not email:
            return Response({'error': 'required data is missing'})
        try:
            user = User.objects.create(
                first_name = first_name,
                last_name = last_name,
                password = password,
                email = email,
            )
        except IntegrityError:
            return Response ({
                'error': 'Пользователь с данным email уже зарегистрирован'
            })
        life_time = (datetime.datetime.now() + datetime.timedelta(hours=1)).timestamp()
        token = jwt.encode(payload={
            'lifetime': life_time,
            'user_id': str(user.id),
        }, key=SECRET_KEY)
        return Response({'success': f'User {first_name} {last_name} successfully registered ', 'token': token})

class AuthAPI(APIView):
    @validation(UserAuthBase)
    def post(self, request):
        data = request.data
        password = data.get('password')
        password = md5(password.encode()).hexdigest()
        email = data.get('email')
        print(email)
        try:
            user = User.objects.get(email = email, password = password)
        except User.DoesNotExist:
            return Response({'error': 'Wrong email or password'})
        life_time = (datetime.datetime.now() + datetime.timedelta(hours=24)).timestamp()
        token = jwt.encode(payload={
            'lifetime': life_time,
            'user_id': str(user.id),
        }, key=SECRET_KEY)
        return Response({'success': f'User {user.first_name} {user.last_name} successfully authorized ', 'token': token, 'user': f'{user.first_name} {user.last_name}'})

class GetMyDrivers(APIView):
    @authrequired(['client_manager', 'admin'])
    def get(self, request, user):
        drivers = User.objects.filter(organisation=user.organisation, type='driver')
        data = [[x.id, str(x)] for x in drivers]
        return Response({
            'data': data
        })



class RegOrg(APIView):
    @authrequired(['manager', 'admin'])
    def post(self, request, user):
        data = request.data
        name = data.get('name')
        bin = data.get('bin')
        try:
            org = Organisation.objects.create(
                name = name,
                bin = bin
            )
        except IntegrityError:
            return Response({'error': 'Данная организация уже есть в системе'})

        return Response({
            'success': f'Организация {name} успешно зарегистрирована'
        })
    @authrequired(['manager', 'admin'])
    def get(self, request, user):
        orgs = Organisation.objects.all()
        data = [(x for x in (org.name, org.bin)) for org in orgs]
        return Response({
            'data': data
        })
    

    
class AssignUserType(APIView):
    @authrequired(['manager', 'admin'])
    def post(self, request, user):
        types = ['client', 'manager', 'driver', 'admin', 'client_manager', 'cassier']
        data = request.data
        user_id = data.get('user_id')
        type = data.get('type')
        if type not in types:   
            return Response({
                'error': 'invalid user type'
            })
        user = User.objects.get(id=user_id)
        user.type = type
        user.save()
        return Response({
            'success': f'Пользователю {user} назначена роль {type}'
        })
    
class AssignOrg(APIView):
    @authrequired(['manager', 'admin'])
    def post(self, request, user):
        data = request.data
        user_id = data.get('user_id')
        org_id = data.get('org_id')
        user = User.objects.get(id=user_id)
        org = Organisation(id=org_id)
        user.organisation = org
        user.save()
   
        return Response({
            'success': f'Пользователь {user} присвоен к организации {org}'
        })
    
class DeleteOrg(APIView):
    @authrequired(['manager', 'admin',])
    def post(self, request, user):
        org = Organisation(id=request.data.get('org_id'))
   
        return Response({
            'success': f'Организация {org} удалена'
        })    
    # @authrequired(['manager', 'admin', 'client_manager'])
    # def get_orgs(request):
    #     orgs = Organisation.objects.all()
    #     data = [[x for x in (str(org.id), org.name, org.bin)] for org in orgs] 
    #     return JsonResponse({
    #         'orgs': data
    #     })
    




def delete(request):
    users = User.objects.all()
    users.delete()
    return JsonResponse({
        'success': 'all users deleted'
    }
    )
def delete_orgs(request):
    orgs = Organisation.objects.all()
    orgs.delete()
    return JsonResponse({'success': 'all orgs deleted'})
def get_users(request):
    users = User.objects.all()
    data = [[x for x in (str(user.id), user.last_name)] for user in users] 
    return JsonResponse({'data': data})

def web_page(request):
    users = User.objects.all()
    orgs = Organisation.objects.all()
    tickets = Tickets.objects.all()
    assigned_tickets = AssignedTickets.objects.all()
    gsms = ['92','95','dt']
    drivers_tickets = [{str(user): [{gsm: sum([(x.quantity - x.used_quantity) for x in assigned_tickets if x.quantity > x.used_quantity and x.tickets.gsm == gsm and x.user == user])} for gsm in gsms] } for user in users]
    context = {
        'users': users,
        'orgs': orgs,
        'tickets': tickets,
        'assigned_tickets': assigned_tickets,
        'drivers_tickets': drivers_tickets,
    }

    return render(request, 'index.html', context=context)

def users_list(request):
    users = [str(x) for x in User.objects.all()]
    print(users)

    return JsonResponse({'users': users})

class DeleteUserAPI(APIView):
    @authrequired(['manager', 'admin'])
    def post(self, request, user):
        user = User.objects.get(id = request.data.get('user_id'))
        user.delete()
        return Response({
            'success': f'Пользователь {user} успешно удален'
        })
    
class AdminDataAPI(APIView):
    @authrequired(['manager', 'admin'])
    def get(self, request, user):
        users = User.objects.all()
        organisations = Organisation.objects.all()
        data = {
            'users': ((x.id, str(x), x.type, str(x.organisation)) for x in users),
            'organisations': ((x.id, str(x)) for x in organisations),
        }
        
        return Response({
            'data': data
        })
