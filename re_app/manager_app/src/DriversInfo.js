import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

function DriversInfo() {
  const [driversData, setDriversData] = useState({});
  const [filteredDriver, setFilteredDriver] = useState('all');
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchDriversInfo = async () => {
      const token = localStorage.getItem('token');
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/v1/drivers_info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resp.ok) throw new Error('Ошибка загрузки данных о водителях');

        const json = await resp.json();
        setDriversData(json.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDriversInfo();
  }, []);

  const handleExport = () => {
    const exportData = [];

  

  
    Object.entries(visibleData).forEach(([driver, fuels]) => {
      Object.entries(fuels).forEach(([fuel, qty]) => {
        exportData.push({
          'Водитель': driver,
          'Тип топлива': fuel,
          'Доступно': qty,
        });
      });
    });
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Водители');
    XLSX.writeFile(workbook, 'drivers_info.xlsx');
  };

  const handleUsedTicketsExport = async () => {
    if (!startDate || !endDate) {
      setError("Пожалуйста, выберите обе даты");
      return;
    }
  
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
  
    if (diff < 0) {
      setError("Дата конца не может быть раньше начала");
      return;
    }
    if (diff > 93) {
      setError("Интервал не может превышать 3 месяцев");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://127.0.0.1:8000/api/v1/used_tickets_info?start=${startDate}&end=${endDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!resp.ok) throw new Error('Ошибка при получении использованных талонов');
      const result = await resp.json();
      const usedData = result.data || [];
  
      const formatted = usedData.map(([user, gsm, quantity, used_time]) => ({
        'Водитель': user,
        'Тип топлива': gsm,
        'Количество': quantity,
        'Дата использования': used_time,
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Использование талонов');
      XLSX.writeFile(workbook, 'used_tickets.xlsx');
    } catch (err) {
      setError(err.message);
    }
  };
  
  

  const availableDrivers = Object.keys(driversData);
  const visibleData =
    filteredDriver === 'all'
      ? driversData
      : { [filteredDriver]: driversData[filteredDriver] };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Информация о талонах водителей</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="driver-filter">Фильтр по водителю: </label>
        <select
          id="driver-filter"
          value={filteredDriver}
          onChange={(e) => setFilteredDriver(e.target.value)}
        >
          <option value="all">Все водители</option>
          {availableDrivers.map((driver) => (
            <option key={driver} value={driver}>
              {driver}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleExport} style={{ marginBottom: '15px' }}>
        📥 Скачать Excel(остатки)
      </button>

      <div>
        <label>С: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label>По: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button onClick={handleUsedTicketsExport}>📄 Скачать данные по использованным талонам</button>
      </div>
      



      {Object.keys(visibleData).length === 0 ? (
        <p>Нет данных</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Водитель</th>
              <th>Тип топлива</th>
              <th>Доступно</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(visibleData).map(([driver, fuels]) =>
              Object.entries(fuels).map(([fuel, qty], idx) => (
                <tr key={`${driver}-${fuel}`}>
                  {idx === 0 ? (
                    <td rowSpan={Object.keys(fuels).length}>{driver}</td>
                  ) : null}
                  <td>{fuel}</td>
                  <td>{qty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      <Link to="/manager" style={{ display: 'inline-block', marginTop: '20px' }}>
        ← Вернуться
      </Link>
    </div>
  );
}

export default DriversInfo;
