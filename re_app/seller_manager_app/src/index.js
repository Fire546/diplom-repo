import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import Login from './Login';
import Manager from './Manager';
// import AssignTicket from './AssignTicket';
import DriversInfo from './DriversInfo';
import ChangePassword from './changePassword';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Login /> },
      { path: 'manager', element: <Manager /> },
      { path: 'drivers', element: <DriversInfo /> },
      { path: 'change_password', element: <ChangePassword /> },
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
