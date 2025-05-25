import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- Pastikan ini dari 'react-dom/client'
import '../index.css'; // Atau file CSS global Anda
import { Provider } from 'react-redux';
import store from './redux/store';
import Router from './routes/router';

const root = ReactDOM.createRoot(document.getElementById('root')); // <-- Penggunaan yang benar untuk React 18+
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router/>
    </Provider>
  </React.StrictMode>
);