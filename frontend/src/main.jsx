import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/i18n.js';
import App from './App.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { CivicProvider } from './context/CivicContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <CivicProvider>
        <App />
      </CivicProvider>
    </LanguageProvider>
  </React.StrictMode>
);
