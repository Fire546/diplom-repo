"""
URL configuration for gsmtickets project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from users.views import  DeleteOrg, AdminDataAPI, RegAuth, DeleteUserAPI, delete, get_users, RegOrg, delete_orgs, AssignUserType, AssignOrg, web_page, users_list, AuthAPI, GetMyDrivers
from tickets.views import CassierOperationsAPI, UsedTicketsInfoAPI, CheckDriversTicketsAPI, GetAllDriversInfoAPI, GetAllTicketsAPI, TicketsAPI, AssignedTicketsAPI, UsingTicketsAPI, del_tickets, ApproveTicketsAPI, DriversInfoApi

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/users', RegAuth.as_view()),
    path('api/v1/users_auth', AuthAPI.as_view()),
    path('api/v1/orgs', RegOrg.as_view()),
    path('api/v1/user_type', AssignUserType.as_view()),
    path('api/v1/assign_org', AssignOrg.as_view()),
    path('api/v1/delete_org', DeleteOrg.as_view()),
    path('api/v1/get_drivers', GetMyDrivers.as_view()),
    path('api/v1/delete_user', DeleteUserAPI.as_view()),
    path('api/v1/admin_data', AdminDataAPI.as_view()),
    
    
    path('api/v1/tickets', TicketsAPI.as_view()),
    path('api/v1/tickets_approve', ApproveTicketsAPI.as_view()),
    path('api/v1/assign_tickets', AssignedTicketsAPI.as_view()),
    path('api/v1/use_tickets', UsingTicketsAPI.as_view()),
    path('api/v1/drivers_info', DriversInfoApi.as_view()),
    path('api/v1/all_tickets', GetAllTicketsAPI.as_view()),
    path('api/v1/all_drivers_info', GetAllDriversInfoAPI.as_view()),
    path('api/v1/check_drivers_tickets', CheckDriversTicketsAPI.as_view()),
    path('api/v1/cassier_operations', CassierOperationsAPI.as_view()),
    path('api/v1/used_tickets_info', UsedTicketsInfoAPI.as_view()),

    path('delete', delete),
    path('delete_orgs', delete_orgs),
    path('get_users', get_users),
    path('', web_page),
    path('del_tickets', del_tickets),
    path('users_list', users_list),
]
