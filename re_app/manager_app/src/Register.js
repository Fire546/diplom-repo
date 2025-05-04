import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const resp = await fetch('http://localhost:8000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        setIsSuccess(false);
        setMessage(data.error || 'Ошибка регистрации');
      } else {
        setIsSuccess(true);
        setMessage(data.success || 'Регистрация прошла успешно');
        // Очищаем форму:
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage('Произошла ошибка при соединении с сервером');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Имя:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Фамилия:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {message && (
          <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>
        )}
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Уже есть аккаунт? <a href="/">Войти</a>
      </p>
    </div>
  );
}

export default Register;
