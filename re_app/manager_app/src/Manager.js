import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Manager() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gsm, setGsm] = useState('92');
  const [quantity, setQuantity] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Фильтрация
  const filteredTickets = tickets.filter(([fuel, qty, used, date, status]) => {
    const passFuel = fuelFilter === 'all' || fuel === fuelFilter;
    const passStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && status === 'approved') ||
      (statusFilter === 'pending' && status !== 'approved');
  
    const dateObj = new Date(date);
    const passDateFrom = !dateFrom || dateObj >= new Date(dateFrom);
    const passDateTo = !dateTo || dateObj <= new Date(dateTo);
  
    return passFuel && passStatus && passDateFrom && passDateTo;
  });
  


  // Получение списка заявок
  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Нет токена');
      return;
    }

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) throw new Error('Ошибка получения заявок');

      const data = await resp.json();
      setTickets(data.tickets);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Обработка создания новой заявки
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gsm,
          quantity,
        }),
      });

      if (!resp.ok) throw new Error('Ошибка при создании заявки');

      setSuccess('Заявка успешно создана!');
      setQuantity('');
      await fetchTickets(); // обновим список

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Панель менеджера</h2>

      <Link to="/drivers" style={{ display: 'inline-block', marginBottom: '15px' }}>
        Посмотреть информацию о водителях
      </Link>

      {/* Форма создания заявки */}
      <form onSubmit={handleCreateTicket} style={{ marginBottom: '20px' }}>
        <label>Тип топлива:</label>
        <select value={gsm} onChange={(e) => setGsm(e.target.value)} required>
          <option value="92">AI-92</option>
          <option value="95">AI-95</option>
          <option value="dt">Дизель</option>
        </select>

        <label>Количество:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <button type="submit">Создать заявку</button>
      </form>

      {/* Сообщения */}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      
      {/* фильтры */}
      <div style={{ marginBottom: '20px' }}>
        <label>Тип топлива: </label>
        <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
          <option value="all">Все</option>
          <option value="92">AI-92</option>
          <option value="95">AI-95</option>
          <option value="dt">Дизель</option>
        </select>

        <label style={{ marginLeft: '20px' }}>Статус: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Все</option>
          <option value="approved">Одобрена</option>
          <option value="pending">На рассмотрении</option>
        </select>

        <label style={{ marginLeft: '20px' }}>Дата с: </label>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />

        <label style={{ marginLeft: '10px' }}>по: </label>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>
      <button
        onClick={() => {
          setFuelFilter('all');
          setStatusFilter('all');
          setDateFrom('');
          setDateTo('');
        }}
        style={{ marginLeft: '20px' }}
      >
        Сбросить фильтры
      </button>



      {/* Таблица заявок */}
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Топливо</th>
            <th>Количество</th>
            <th>Израсходовано</th>
            <th>Время заказа</th>
            <th>Тип</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
        {filteredTickets.map((t, i) => (
          <tr key={i}>
            <td>{t[0]}</td>
            <td>{t[1]}</td>
            <td>{t[2]}</td>
            <td>{t[3]}</td>
            <td>
              {t[4] === 'approved' ? 'Заявка одобрена' : 'На рассмотрении'}
            </td>
            <td>
              {t[4] === 'approved' ? (
                <Link to={`/assign/${t[5]}`}>Распределить</Link>
              ) : (
                '-'
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
