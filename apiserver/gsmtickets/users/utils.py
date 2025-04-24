from rest_framework.serializers import (
    Serializer, IntegerField, UUIDField, CharField, DateField
)    
from pydantic import BaseModel, Field, ValidationError
from rest_framework.response import Response
from typing import Optional
from functools import wraps
import jwt
import datetime
from users.models import User
from tickets.models import AssignedTickets
from gsmtickets.settings import SECRET_KEY
import logging
from functools import wraps
from django.utils.timezone import now
from jwt import decode, InvalidTokenError


class UserRegBase(BaseModel):
    first_name : str = Field(...)
    last_name : str = Field(...)
    password : str = Field(...)
    email : str = Field(...)
    
class UserAuthBase(BaseModel):
    password : str = Field(...)
    email : str = Field(...)


def get_user_from_token(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return 'Anonymous'

        token = auth_header.split(' ')[1]
        payload = decode(token, algorithms=['HS256'], key=SECRET_KEY)
        user_id = payload.get('user_id')

        user = User.objects.get(id=user_id)
        return f"{user.first_name} {user.last_name} ({user.email})"
    except (User.DoesNotExist, InvalidTokenError, IndexError, AttributeError, Exception):
        return 'Anonymous'


def validation(model: BaseModel = None, ):
    def decorator(func):
        @wraps(decorator)
        def wrapper(self, request, *args, **kwargs):
            try:
                model(**request.data)
                return(func(self, request, *args, **kwargs))
            except (ValidationError, Exception) as e:
                print(str(e))
                return Response({'error': 'Ошибка валидации'})
        return wrapper
    return decorator

def authrequired(user_type_required: list [str] = None, ):
    def decorator(func):
        @wraps(decorator)
        def wrapper(self, request, *args, **kwargs):
            try:
                token = request.headers.get('Authorization').split(' ')[1]
            except:
                return Response({'error':'unauthorized'})
            payload = jwt.decode(token, algorithms='HS256', key=SECRET_KEY)
            user_id = payload.get('user_id')
            life_time = payload.get('lifetime')
            if life_time < datetime.datetime.now().timestamp():
                return Response({'error': 'token expired'})
            user = User.objects.get(id = user_id)
            if not token:
                return Response({'error': 'unauthorized'})
            if user_type_required: 
                if not user.type in user_type_required:
                    return Response({'error': 'access denied'})
            return(func(self, request, user, *args, **kwargs))
        return wrapper
    return decorator


# class UserSerializer(Serializer):
#     id = UUIDField()
#     model = CharField(max_length=32)
#     engine = CharField(max_length=32)
#     info = CharField(max_length=256)
#     created_at = DateField()

logger = logging.getLogger('api')

def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0]
    return request.META.get('REMOTE_ADDR')

def log_api_request(func):
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        user = getattr(request, 'user', None)
        user_repr = get_user_from_token(request)
        
        response = func(self, request, *args, **kwargs)  # вызываем один раз

        logger.info(
            f"[{now().isoformat()}] "
            f"User: {user_repr}, "
            f"IP: {get_client_ip(request)}, "
            f"Method: {request.method}, "
            f"Path: {request.get_full_path()}, "
            f"Data: {dict(request.data)}, "
            f"Response: {response.status_code} - {getattr(response, 'data', '')}"
        )

        return response
    return wrapper
