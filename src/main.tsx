import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
console.log("ENV URL:", import.meta.env.VITE_SUPABASE_URL);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/drinkmix.github.io">
    <App />
    </BrowserRouter>
  </React.StrictMode>
);
