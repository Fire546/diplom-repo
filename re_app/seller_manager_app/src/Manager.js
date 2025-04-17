import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Manager() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Нет токена');
      return;
    }

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/all_tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) throw new Error('Ошибка получения заявок');

      const data = await resp.json();
      setTickets(data.tickets); // такой же формат: [[gsm, quantity, used_quantity, order_time, type, id]]
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleApprove = async (ticketId) => {
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/tickets_approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tickets_id: ticketId }),
      });

      const data = await resp.json();

      if (data.success) {
        setMessage(data.success);
        fetchTickets(); // обновим список
      } else {
        setMessage(data.error || 'Ошибка при одобрении заявки');
      }
    } catch (err) {
      setMessage('Ошибка при отправке запроса');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/drivers" style={{ display: 'inline-block', marginBottom: '15px' }}>
        Посмотреть информацию о водителях
      </Link>
      <h2>Заявки от организаций</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Организация</th>
            <th>Топливо</th>
            <th>Количество</th>
            <th>Израсходовано</th>
            <th>Время заказа</th>
            <th>Тип</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={i}>
              <td>{t[0]}</td>
              <td>{t[1]}</td>
              <td>{t[2]}</td>
              <td>{t[3]}</td>
              <td>{t[4]}</td>
              <td>{t[5]}</td>
              <td>
                {t[5] === 'ordered' ? (
                  <button onClick={() => handleApprove(t[6])}>Одобрить</button>
                ) : (
                  "Заявка одобрена"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Manager;
