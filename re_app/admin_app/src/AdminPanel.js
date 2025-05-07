import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [message, setMessage] = useState('');
  const [orgToAssign, setOrgToAssign] = useState('');
  const [orgToDelete, setOrgToDelete] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchOrg, setSearchOrg] = useState('');
  const token = localStorage.getItem('token');

  const filteredUsers = users.filter(([_, name, __, org]) => {
    const matchesName = name.toLowerCase().includes(searchName.toLowerCase());
    const matchesOrg = (org || '').toLowerCase().includes(searchOrg.toLowerCase());
    return matchesName && matchesOrg;
  });
  



  const [regData, setRegData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const [selectedUserId, setSelectedUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  // Загрузка данных
  const fetchAdminData = async () => {
    
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/admin_data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await resp.json();
      setUsers(data.data.users);
      setOrganisations(data.data.organisations);
    } catch (err) {
      setMessage('Ошибка загрузки данных');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  function SearchableSelect({ value, onChange, options, placeholder }) {
    const [search, setSearch] = useState('');
  
    const filtered = options.filter(([_, name]) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  
    return (
      <div style={{ marginBottom: '10px', maxWidth: '300px' }}>
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '6px 10px',
            marginBottom: '5px',
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
        <select
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}
        >
          <option value="">Выберите</option>
          {filtered.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>
    );
  }
  
  

  // Создание пользователя
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(regData),
      });

      const data = await resp.json();
      if (data.success) {
        setMessage('Пользователь создан');
        setRegData({ first_name: '', last_name: '', email: '', password: '' });
        fetchAdminData();
      } else {
        setMessage(data.error || 'Ошибка при создании');
      }
    } catch {
      setMessage('Сервер не отвечает');
    }
  };

  // Присвоение роли
  const handleSetRole = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/user_type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          user_id: selectedUserId,
          type: userRole,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setMessage('Роль присвоена');
        fetchAdminData();
      } else {
        setMessage(data.error || 'Ошибка назначения роли');
      }
    } catch {
      setMessage('Ошибка соединения');
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/delete_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,

         },
        body: JSON.stringify({ user_id: selectedUserId }),
      });

      const data = await resp.json();
      if (data.success) {
        setMessage('Пользователь удалён');
        fetchAdminData();
      } else {
        setMessage(data.error || 'Ошибка удаления');
      }
    } catch {
      setMessage('Ошибка запроса');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Панель администратора</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <Link to="/change_password">Сменить пароль</Link>
      <br></br>
      {/* Создание пользователя */}
      <section style={{ marginBottom: '20px' }}>
        <h3>Создать пользователя</h3>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Имя"
            value={regData.first_name}
            onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={regData.last_name}
            onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={regData.email}
            onChange={(e) => setRegData({ ...regData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={regData.password}
            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
            required
          />
          <button type="submit">Создать</button>
        </form>
      </section>


        {/* Пользователи с ролями и организациями */}
        <h3>Список пользователей</h3>
        <input
          type="text"
          placeholder="Поиск по имени"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Поиск по организации"
          value={searchOrg}
          onChange={(e) => setSearchOrg(e.target.value)}
        />
      <section style={{ marginTop: '30px' }}>
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
        <table border="1" cellPadding="8" cellSpacing="0">
            <thead>
            <tr>
                <th>ФИО</th>
                <th>Роль</th>
                <th>Организация</th>
            </tr>
            </thead>
            <tbody>
            {filteredUsers.map(([id, name, type, org]) => (
                <tr key={id}>
                <td>{name}</td>
                <td>{type}</td>
                <td>{org || '-'}</td>
                </tr>
            ))}
            </tbody>
        </table>
            </div>
        </section>

        {/* Создание организации */}
        <section style={{ marginTop: '30px' }}>
            <h3>Создать организацию</h3>
            <form
                onSubmit={async (e) => {
                e.preventDefault();
                const name = e.target.name.value;
                const bin = e.target.bin.value;

                try {
                    const token = localStorage.getItem('token');
                    const resp = await fetch('http://127.0.0.1:8000/api/v1/orgs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, bin }),
                    });

                    const data = await resp.json();
                    if (data.success) {
                    setMessage(data.success);
                    e.target.reset();
                    fetchAdminData();
                    } else {
                    setMessage(data.error || 'Ошибка создания');
                    }
                } catch {
                    setMessage('Сервер недоступен');
                }
                }}
            >
                <input type="text" name="name" placeholder="Название" required />
                <input type="text" name="bin" placeholder="БИН" required />
                <button type="submit">Создать</button>
            </form>
            </section>

        {/* Привязка пользователя к организации */}
        <section style={{ marginTop: '30px' }}>
            <h3>Привязать пользователя к организации</h3>

            <SearchableSelect
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              options={users.map(([id, name]) => [id, name])}
              placeholder="Поиск пользователя"
            />

            <SearchableSelect
              value={orgToAssign}
              onChange={(e) => setOrgToAssign(e.target.value)}
              options={organisations}
              placeholder="Поиск организации"
            />


            <button
                onClick={async () => {
                const token = localStorage.getItem('token');
                try {
                    const resp = await fetch('http://127.0.0.1:8000/api/v1/assign_org', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ user_id: selectedUserId, org_id: orgToAssign }),
                    });

                    const data = await resp.json();
                    if (data.success) {
                    setMessage(data.success);
                    fetchAdminData();
                    } else {
                    setMessage(data.error || 'Ошибка привязки');
                    }
                } catch {
                    setMessage('Ошибка подключения');
                }
                }}
                disabled={!selectedUserId || !orgToAssign}
            >
                Назначить
            </button>
            </section>


        {/* Удаление организации */}
        <section style={{ marginTop: '30px' }}>
            <h3>Удалить организацию</h3>

            <select value={orgToDelete} onChange={(e) => setOrgToDelete(e.target.value)}>
                <option value="">Выберите организацию</option>
                {organisations.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
                ))}
            </select>

            <button
                onClick={async () => {
                const token = localStorage.getItem('token');

                try {
                    const resp = await fetch('http://127.0.0.1:8000/api/v1/delete_org', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ org_id: orgToDelete }),
                    });

                    const data = await resp.json();
                    if (data.success) {
                    setMessage(data.success);
                    fetchAdminData();
                    setOrgToDelete('');
                    } else {
                    setMessage(data.error || 'Ошибка удаления');
                    }
                } catch {
                    setMessage('Ошибка соединения');
                }
                }}
                disabled={!orgToDelete}
            >
                Удалить
            </button>
            </section>



      {/* Назначение роли */}
      <section style={{ marginBottom: '20px' }}>
        <h3>Назначить роль пользователю</h3>
        <SearchableSelect
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          options={users.map(([id, name]) => [id, name])}
          placeholder="Поиск пользователя"
        />

        <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          <option value="">Выберите роль</option>
          <option value="manager">Менеджер</option>
          <option value="client_manager">Менеджер-клиент</option>
          <option value="driver">Водитель</option>
          <option value="admin">Админ</option>
          <option value="cassier">Кассир</option>
        </select>

        <button onClick={handleSetRole}>Назначить</button>
      </section>

      {/* Удаление пользователя */}
      <section>
        <h3>Удалить пользователя</h3>
        <SearchableSelect
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          options={users.map(([id, name]) => [id, name])}
          placeholder="Поиск пользователя"
        />
        <button onClick={handleDeleteUser}>Удалить</button>
      </section>
    </div>
  );
}

export default AdminPanel;
