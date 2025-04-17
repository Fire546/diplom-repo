import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function AssignTicket() {
  const { id } = useParams(); // ID заявки
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      const token = localStorage.getItem('token');
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/v1/get_drivers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await resp.json();
        setDrivers(data.data); // ожидаем [[id, str]]
      } catch (err) {
        setMessage('Ошибка загрузки водителей');
      }
    };

    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const payload = {
      user_id: selectedDriver,
      tickets_id: id,
      quantity: quantity,
    };

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/assign_tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (data.success) {
        setMessage(data.success);
        setTimeout(() => navigate('/manager'), 1500);
      } else if (data.error) {
        setMessage(data.error);
      } else {
        setMessage('Неизвестный ответ от сервера');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Распределение заявки</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Водитель:</label>
          <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} required>
            <option value="">Выберите водителя</option>
            {drivers.map(([driverId, driverName]) => (
              <option key={driverId} value={driverId}>
                {driverName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Количество:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        {message && <p>{message}</p>}

        <button type="submit">Отправить</button>
      </form>
      <Link to="/manager" style={{ display: 'inline-block', marginBottom: '15px' }}>
        вернуться
      </Link>
    </div>
  );
}

export default AssignTicket;
