import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Manager() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  

  const sortedTickets = [...tickets].sort((a, b) => new Date(b[4]) - new Date(a[4]));

  const availableOrgs = [...new Set(tickets.map(([org]) => org))];

  // Фильтрация
  const filteredTickets = sortedTickets.filter(([org, fuel, qty, used, date, status]) => {
    const passOrg = orgFilter === 'all' || org === orgFilter;
    const passFuel = fuelFilter === 'all' || fuel === fuelFilter;
    const passStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && status === 'approved') ||
      (statusFilter === 'pending' && status !== 'approved');

    const dateObj = new Date(date);
    const passDateFrom = !dateFrom || dateObj >= new Date(dateFrom);
    const passDateTo = !dateTo || dateObj <= new Date(dateTo);

    return passOrg && passFuel && passStatus && passDateFrom && passDateTo;
  });

  
  

  const fetchTickets = async (startDate = null, endDate = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Нет токена');
      return;
    }
  
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
  
    try {
      const url = `http://127.0.0.1:8000/api/v1/all_tickets${params.toString() ? `?${params.toString()}` : ''}`;
      
      const resp = await fetch(url, {
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
    if (dateFrom && dateTo) {
      fetchTickets(dateFrom, dateTo);
    } else {
      fetchTickets();
    }
  }, [dateFrom, dateTo]);
  

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

      {/* фильтры */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginLeft: '20px' }}>Организация: </label>
        <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)}>
          <option value="all">Все</option>
          {availableOrgs.map((org, i) => (
            <option key={i} value={org}>{org}</option>
          ))}
        </select>

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

      <h2>Заявки от организаций</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
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
            {filteredTickets.map((t, i) => (
              <tr key={i}>
                <td>{t[0]}</td>
                <td>{t[1]}</td>
                <td>{t[2]}</td>
                <td>{t[3]}</td>
                <td>{new Date(t[4]).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</td>
                <td>{t[5] === 'approved' ? 'Заявка одобрена' : 'На рассмотрении'}</td>
                <td>
                  {t[5] === 'ordered' ? (
                    <button onClick={() => handleApprove(t[6])}>Одобрить</button>
                  ) : (
                    'Одобрено'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Manager;
