import requests
url = 'http://127.0.0.1:8000/api/v1/'
base_url = 'http://127.0.0.1:8000/'
first_name = 'Bob'
last_name = 'Johnson'
password = '123'
email = 'sarah@mail.ru'
name = 'TOO "Solnyshko"'
bin = '150619008589'
org_reg_data = {
    'name': name,
    'bin': bin
}
type_data = {
    'user_id': '4bbc3041-5044-402e-84e1-a4a5dc2475ae',
    'type': 'manager'
}
reg_data = {
    'first_name': first_name,
    'last_name': last_name,
    'password': password,
    'email': email,
}
auth_data = {
    'password': password,
    'email': email,
}

# resp = requests.post(url+'users', json = reg_data)
# print(resp.json())

# resp = requests.post(url+'delete_user', json = {'user_id':''})

resp = requests.post(url+'users_auth', json = auth_data)
# print(resp.json())
token = resp.json().get('token')
headers = {
    'Authorization': f"Bearer {token}"
}
print(token)


# resp = requests.get('http://127.0.0.1:8000/delete')
# print(resp.json())

# resp = requests.get(url+'orgs')
# print(resp.json())

# resp = requests.post(url+'user_type', json=type_data)
# print(resp.json())

# resp = requests.get(base_url+'get_users').json()
# print(resp)

# Создание заявки

# resp = requests.post(url+'tickets', headers=headers, json={'gsm': '95', 'quantity':'1000'})
# print(resp.json())

# Получение списка всех заявок организации

# resp = requests.get(url+'tickets', headers=headers)
# print(resp.json())

# Одобрение заявки
# resp = requests.post(url+'tickets_approve', headers=headers, json={'tickets_id': '1648f5f5-6606-4a3a-9414-c6865d484d96'})
# print(resp.json())

# Распределение талонов с заявки на водителя
# resp = requests.post(url+'assign_tickets', headers=headers, json={
#     'user_id': '4bbc3041-5044-402e-84e1-a4a5dc2475ae', 
#     'tickets_id': 'aa029fcc-511e-4d65-a85e-a35436b2ea0f',
#     'quantity': '100',
# })
# print(resp.json())

# Получение данных о имеющихся у водителя талонах (водителем)
# resp = requests.get(url+'use_tickets', headers=headers,)
# print(resp.json())



# Использование талонов водителем
# resp = requests.post(url+'use_tickets', headers=headers, json={
#     'gsm': '92',
#     'quantity': '50',
# })
# print(resp.json())


# Выдача информации по водителям организации (их доступным талонам)
# resp = requests.get(url+'drivers_info', headers=headers,)
# print(resp.json())

# Выдача информации по всем водителям всех организаций (их доступным талонам)
# resp = requests.get(url+'all_drivers_info', headers=headers,)
# print(resp.json())

# Информация по всем пользователям и всем организациям
# resp = requests.get(url+'admin_data', headers=headers,)
# print(resp.json())

# Проверка наличия запрошенных талонов у водителя
# resp = requests.post(url+'check_drivers_tickets', headers=headers, json={'gsm':'92', 'quantity': 100, 'token':token})
# print(resp.json())

# Информация по отпуску ГСМ по талонам с АЗС
resp = requests.get(url+'used_tickets_info', headers=headers,)
print(resp.json())

# Задача(выполнена)
# Водитель предъявлет qr код с приложения, который содержит его токен, тип и количество ГСМ, которые он хочет получить

# Задача(выполнена)
# Сделать страничку для менеджера-клиента, где он будет делать заявки на талоны, 
# будет выбирать тип и количество ГСМ и выполнять запрос на сервер о создании заявки
# получать список заявок его организации

# Задача(выполнена)
# На странице менеджера сделать возможность перехода по заявке на страницу с формой,
# где он сможет распределить часть талонов на водителей его организации

# Задача(выполнена)
# Со страницы менеджера должна быть ссылка на таблицу с инфой об имеющихся у их водителей
# талонах

# Задача(выполнена)
# Создание приложения для менеджера продавца, он будет просматривать заявки
# от организаций, одобрять их, просматривать информацию по всем водителям(клиентам)

# Задача
# Создать панель админа. В ней можно создавать пользователей, назначать их роли,
# видеть список пользователей с их ролью, организацией и т.д.
# создавать организации, привязывать пользователей к организациям. Удалять
# пользователей, организации


# Задача 
# Создать панель админа AdminPanel.js. В ней можно создавать пользователей, назначать их роли,
# видеть список пользователей с их ролью, организацией и т.д.
# создавать организации, привязывать пользователей к организациям. Удалять
# пользователей, организации.

# Задача
# Панель кассира. Проводит операции через qr код(пока что просто json), отправляет
# данные с кода на сервер, получает данные от сервера по клиенту и его запросу,
# подтверждает операцию, получает таблицу со своими операциями за день


# Задача
# Создать пользователей сервиса для тестирования
# Админ - bob@mail.ru 123 ТОО Хлебушек
# Менеджер продавец - john@mail.ru 123 ТОО Хлебушек
# Кассир - henry@mail.ru 123 ТОО Хлебушек
# Менеджер клиент  - sarah@mail.ru 123 ТОО Солнышко
# Водитель клиент - alex@mail.ru 123 ТОО Солнышко

# Задача
# Сделать так чтобы qr код можно было использовать
# только один раз