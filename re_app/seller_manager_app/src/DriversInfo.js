import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function DriversInfo() {
  const [driversData, setDriversData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDriversInfo = async () => {
      const token = localStorage.getItem('token');
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/v1/all_drivers_info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resp.ok) throw new Error('Ошибка загрузки данных о водителях');

        const json = await resp.json();
        setDriversData(json.data); // ожидаем словарь { "Иванов Иван": { "92": 100, "95": 50 }, ... }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDriversInfo();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Информация о талонах водителей</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {Object.keys(driversData).length === 0 ? (
        <p>Нет данных</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Организация</th>
              <th>Водитель</th>
              <th>Тип топлива</th>
              <th>Доступно</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(driversData).map(([org, drivers]) => {
              const totalRows = Object.values(drivers).reduce(
                (sum, fuels) => sum + Math.max(1, Object.keys(fuels).length),
                0
              );

              let orgRowRendered = false;

              return Object.entries(drivers).map(([driver, fuels]) => {
                const fuelKeys = Object.keys(fuels);
                const driverRows = Math.max(1, fuelKeys.length);
                let driverRowRendered = false;

                return fuelKeys.length > 0
                  ? fuelKeys.map((fuel, fuelIdx) => (
                      <tr key={`${org}-${driver}-${fuel}`}>
                        {!orgRowRendered && !driverRowRendered && fuelIdx === 0 && (
                          <td rowSpan={totalRows}>{org}</td>
                        )}
                        {!driverRowRendered && fuelIdx === 0 && (
                          <td rowSpan={driverRows}>{driver}</td>
                        )}
                        <td>{fuel}</td>
                        <td>{fuels[fuel]}</td>
                        {fuelIdx === 0 && (orgRowRendered = true)}
                        {fuelIdx === 0 && (driverRowRendered = true)}
                      </tr>
                    ))
                  : (
                      <tr key={`${org}-${driver}-none`}>
                        {!orgRowRendered && (
                          <td rowSpan={totalRows}>{org}</td>
                        )}
                        <td>{driver}</td>
                        <td colSpan="2" style={{ textAlign: 'center' }}>Нет талонов</td>
                        {orgRowRendered = true}
                      </tr>
                    );
              });
            })}
          </tbody>

        </table>
      )}
      <Link to="/manager" style={{ display: 'inline-block', marginBottom: '15px' }}>
        вернуться
      </Link>
    </div>
  );
}

export default DriversInfo;
