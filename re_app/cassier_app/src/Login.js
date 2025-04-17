import { useState } from 'react';
import { useNavigate } from 'react-router-dom';



function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    const authData = {
      email: login,
      password: password,
    };

    try {
      const resp = await fetch('http://localhost:8000/api/v1/users_auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (!resp.ok) {
        throw new Error('Ошибка авторизации');
      }

      const data = await resp.json();
      console.log(data)
      const token = data.token;
      

      localStorage.setItem('token', token);
      

      navigate('/cassier');


    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: 'auto' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Логин:</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;
