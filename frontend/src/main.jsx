import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CivicProvider } from './context/CivicContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CivicProvider>
      <App />
    </CivicProvider>
  </React.StrictMode>
);
