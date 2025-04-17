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



class UserRegBase(BaseModel):
    first_name : str = Field(...)
    last_name : str = Field(...)
    password : str = Field(...)
    email : str = Field(...)
    
class UserAuthBase(BaseModel):
    password : str = Field(...)
    email : str = Field(...)





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

