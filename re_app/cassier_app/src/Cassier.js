import { useState, useEffect, useRef } from 'react';

function Cassier() {
  const [qrData, setQrData] = useState('');
  const [waitingForScan, setWaitingForScan] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // { username, quantity, gsm }
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [operations, setOperations] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    fetchOperations();
  }, []);

  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMsg('');
      }, 5000); // 5 секунд
  
      return () => clearTimeout(timer); // очистка при размонтировании или новом сообщении
    }
  }, [error, successMsg]);

  
  


  const fetchOperations = async () => {
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/cassier_operations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (data.data) {
        setOperations(data.data);
      }
    } catch {
      setError('Не удалось загрузить операции кассира');
    }
  };

  const handleScan = async (dataStr) => {
    let fixedStr = dataStr.trim();
    if (fixedStr.startsWith("{'") && fixedStr.includes("':")) {
      fixedStr = fixedStr.replace(/'/g, '"');
    }

    let parsed;
    try {
      parsed = JSON.parse(fixedStr);
    } catch {
      setError('Ошибка чтения QR: неверный JSON формат');
      return;
    }

    const { token, gsm, quantity, qr_id } = parsed;
    if (!token || !gsm || !quantity || !qr_id) {
      setError('Отсутствуют необходимые данные в QR');
      return;
    }
  
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/check_drivers_tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
         },
        body: JSON.stringify({ token, gsm, quantity, qr_id }),
      });
  
      const data = await resp.json();
  
      if (data.success) {
        setCheckResult({
          username: data.username,
          quantity: data.quantity,
          gsm: data.gsm,
          token: token
        });
        setError('');
        setQrData('');
        setWaitingForScan(false);
      } else {
        setError(data.error || 'Ошибка проверки талонов');
        setWaitingForScan(false);
      }
    } catch {
      setError('Сервер недоступен');
    }
  };
  

  const handleConfirm = async () => {
    const { token, gsm, quantity } = checkResult;

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/use_tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
         },
        body: JSON.stringify({ token, gsm, quantity }),
      });

      const data = await resp.json();

      if (data.success) {
        setSuccessMsg('Операция прошла успешно');
        setCheckResult(null);
        setQrData('');
        fetchOperations();
      } else {
        setError(data.error || 'Ошибка подтверждения');
      }
    } catch {
      setError('Ошибка отправки данных');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Сканирование талонов</h2>

        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!checkResult && !waitingForScan && (
        <button onClick={() => {
          setWaitingForScan(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}>
          Готов к сканированию
        </button>
      )}

      {!checkResult && waitingForScan && (
        <div style={{ marginTop: '10px' }}>
          <p>Ожидание ввода данных с QR-сканера...</p>
          <input
            ref={inputRef}
            type="text"
            value={qrData}
            onChange={(e) => {
              const value = e.target.value;
              setQrData(value);

              if (/^[А-Яа-яЁё]/.test(value)) {
                setError('Ошибка: включена русская раскладка');
                setWaitingForScan(false);
                setQrData('');
                return;
              }

              if (value.endsWith('}')) {
                handleScan(value);
              }
            }}
            // onKeyDown={(e) => {
            //   if (e.key === 'Enter') {
            //     handleScan(qrData);
            //   }
            // }}
            style={{
              opacity: 0,
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />


        </div>
      )}


      {checkResult && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <p><strong>Водитель:</strong> {checkResult.username}</p>
          <p><strong>Топливо:</strong> {checkResult.gsm}</p>
          <p><strong>Количество:</strong> {checkResult.quantity}</p>

          <button onClick={handleConfirm} style={{ marginRight: '10px' }}>Подтвердить</button>
          <button onClick={() => { setCheckResult(null); setQrData(''); }}>Отмена</button>
        </div>
      )}

      {operations.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Проведённые операции</h3>
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Водитель</th>
                <th>Топливо</th>
                <th>Количество</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {operations.map(([user, gsm, quantity, time], index) => (
                <tr key={index}>
                  <td>{user}</td>
                  <td>{gsm}</td>
                  <td>{quantity}</td>
                  <td>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default Cassier;
