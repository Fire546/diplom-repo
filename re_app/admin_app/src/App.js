import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <h1>Админ</h1>
      <Outlet />
    </div>
  );
}

export default App;
