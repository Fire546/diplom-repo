import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

function DriversInfo() {
  const [driversData, setDriversData] = useState({});
  const [filteredDriver, setFilteredDriver] = useState('all');
  const [error, setError] = useState('');

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
          Водитель: driver,
          'Тип топлива': fuel,
          Доступно: qty,
        });
      });
    });
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Водители');
    XLSX.writeFile(workbook, 'drivers_info.xlsx');
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
        📥 Скачать Excel
      </button>

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
