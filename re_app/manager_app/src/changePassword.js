import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ChangePassword() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/change_pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_pass: oldPass,
          new_pass: newPass,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        setMessage('Пароль успешно изменён');
      } else {
        setMessage(data.error || 'Ошибка смены пароля');
      }
    } catch (err) {
      setMessage('Ошибка при запросе');
    }
  };

  return (
    <div>
      <h2>Смена пароля</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Старый пароль: </label>
          <input
            type="password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Новый пароль: </label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
          />
        </div>
        <button type="submit">Сменить пароль</button>
      </form>
      {message && <p>{message}</p>}

      <Link to="/manager" style={{ display: 'inline-block', marginTop: '20px' }}>
        ← Вернуться
      </Link>
    </div>
  );
}

export default ChangePassword;
