import os
import json
import qrcode
import requests
from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.popup import Popup
from kivy.core.window import Window
from io import BytesIO
from kivy.uix.image import Image
from kivy.core.image import Image as CoreImage
from kivy.uix.spinner import Spinner

# Цвет фона
Window.clearcolor = (0.1, 0.1, 0.1, 1)  

BASE_URL = 'http://127.0.0.1:8000/api/v1/'
TOKEN_FILE = 'token.txt'


class LoginScreen(Screen):
    def __init__(self, **kwargs):
        super(LoginScreen, self).__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', padding=40, spacing=20)

        self.email_input = TextInput(
            hint_text="Email", multiline=False, size_hint=(1, None), height=50, background_color=(0.2, 0.2, 0.2, 1),
            foreground_color=(1, 1, 1, 1), hint_text_color=(0.7, 0.7, 0.7, 1)
        )
        self.password_input = TextInput(
            hint_text="Пароль", multiline=False, password=True, size_hint=(1, None), height=50,
            background_color=(0.2, 0.2, 0.2, 1), foreground_color=(1, 1, 1, 1), hint_text_color=(0.7, 0.7, 0.7, 1)
        )
        login_button = Button(
            text="Войти", size_hint=(1, None), height=50, background_color=(0.8, 0.1, 0.1, 1), color=(1, 1, 1, 1)
        )
        login_button.bind(on_press=self.login)

        layout.add_widget(Label(text="Авторизация", font_size=24, color=(1, 1, 1, 1), size_hint=(1, None), height=40))
        layout.add_widget(self.email_input)
        layout.add_widget(self.password_input)
        layout.add_widget(login_button)

        container = BoxLayout(orientation='vertical', padding=20)
        container.add_widget(layout)
        self.add_widget(container)

    def login(self, instance):
        email = self.email_input.text
        password = self.password_input.text
        auth_data = {
            'email': email,
            'password': password
        }

        try:
            response = requests.post(BASE_URL + 'users_auth', json=auth_data)
            if response.status_code == 200:
                token = response.json().get('token', '')
                App.get_running_app().token = token
                App.get_running_app().user_info = response.json().get('data', '')
                self.save_token(token)
                self.manager.current = 'profile'
            else:
                self.show_error("Неверный логин или пароль")
        except Exception as e:
            self.show_error(f"Ошибка подключения: {str(e)}")

    def show_error(self, message):
        popup = Popup(title='Ошибка',
                      content=Label(text=message, color=(1, 0, 0, 1)),
                      size_hint=(None, None), size=(300, 200))
        popup.open()

    def save_token(self, token):
        with open(TOKEN_FILE, 'w') as f:
            f.write(token)


from kivy.uix.gridlayout import GridLayout

class ProfileScreen(Screen):
    def __init__(self, **kwargs):
        super(ProfileScreen, self).__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=10)

        self.label = Label(text="Загрузка талонов...", font_size=18, color=(1, 1, 1, 1))

        self.fuel_spinner = Spinner(text='Выберите топливо', values=['92', '95', 'dt'],
                                    size_hint=(1, None), height=50)
        self.amount_input = TextInput(hint_text="Введите количество", multiline=False,
                                      input_filter='int', size_hint=(1, None), height=50)
        self.confirm_button = Button(text="Подтвердить", size_hint=(1, None), height=50,
                                     background_color=(0.8, 0.1, 0.1, 1))
        self.confirm_button.bind(on_press=self.confirm)

        # Кнопка выхода
        self.logout_button = Button(text="Выйти", size_hint=(1, None), height=50,
                                    background_color=(0.2, 0.2, 0.2, 1), color=(1, 1, 1, 1))
        self.logout_button.bind(on_press=self.logout)

        self.layout.add_widget(self.label)
        self.layout.add_widget(self.fuel_spinner)
        self.layout.add_widget(self.amount_input)
        self.layout.add_widget(self.confirm_button)
        self.layout.add_widget(self.logout_button)

        self.add_widget(self.layout)

    def on_enter(self, *args):
        headers = {"Authorization": f"Bearer {App.get_running_app().token}"}
        try:
            response = requests.get(BASE_URL + 'use_tickets', headers=headers)
            if response.status_code == 200:
                self.ticket_data = response.json()
                self.label.text = f"Талоны для {self.ticket_data.get('user', 'пользователя')}:\n" \
                                  f"92: {self.ticket_data.get('92', 0)} | " \
                                  f"95: {self.ticket_data.get('95', 0)} | " \
                                  f"ДТ: {self.ticket_data.get('dt', 0)}"
            else:
                self.label.text = "Ошибка получения данных о талонах"
        except Exception as e:
            self.label.text = f"Ошибка: {str(e)}"

    def confirm(self, instance):
        selected_fuel = self.fuel_spinner.text
        try:
            selected_amount = int(self.amount_input.text)
        except ValueError:
            self.show_popup("Введите корректное количество")
            return
        available = int(self.ticket_data.get(selected_fuel, 0))
        if selected_amount > available:
            self.show_popup("Недостаточно талонов")
            return
        if not selected_fuel or not selected_amount:
            self.show_popup("Выберите топливо и введите количество.")
            return
        App.get_running_app().qr_data = json.dumps({
            "token": App.get_running_app().token,
            "gsm": selected_fuel,
            "quantity": int(selected_amount)
        })
        self.manager.current = 'qr'

    def logout(self, instance):
        App.get_running_app().token = ''
        if os.path.exists(TOKEN_FILE):
            os.remove(TOKEN_FILE)
        self.manager.current = 'login'

    def show_popup(self, message):
        popup = Popup(title='Ошибка', content=Label(text=message),
                      size_hint=(None, None), size=(300, 200))
        popup.open()


class QRCodeScreen(Screen):
    def __init__(self, **kwargs):
        super(QRCodeScreen, self).__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=10)
        self.qr_image = Image()
        self.json_box = TextInput(
            text='',
            readonly=True,
            multiline=True,
            size_hint=(1, None),
            height=150,
            background_color=(0.15, 0.15, 0.15, 1),
            foreground_color=(1, 1, 1, 1),
            cursor_color=(1, 1, 1, 1)
        )  

        
        self.back_button = Button(text="Назад", size_hint=(1, None), height=50,
                                  background_color=(0.2, 0.2, 0.2, 1), color=(1, 1, 1, 1))
        self.back_button.bind(on_press=self.go_back)

        self.layout.add_widget(Label(text="Ваш QR-код", font_size=20, color=(1, 1, 1, 1)))
        self.layout.add_widget(self.json_box)
        self.layout.add_widget(self.qr_image)
        self.layout.add_widget(self.back_button)
        self.add_widget(self.layout)

    def on_enter(self, *args):
        data = App.get_running_app().qr_data
        formatted_data = json.dumps(data, indent=2, ensure_ascii=False)
        self.json_box.text = formatted_data
        qr = qrcode.make(data)
        buf = BytesIO()
        qr.save(buf, format='PNG')
        buf.seek(0)

        im = CoreImage(buf, ext='png')
        self.qr_image.texture = im.texture

    def go_back(self, instance):
        self.manager.current = 'profile'



        


class MyApp(App):
    token = ''
    user_info = {}

    def build(self):
        sm = ScreenManager()

        
        sm.add_widget(LoginScreen(name='login'))
        sm.add_widget(ProfileScreen(name='profile'))
        sm.add_widget(QRCodeScreen(name='qr'))

        return sm


if __name__ == '__main__':
    MyApp().run()
