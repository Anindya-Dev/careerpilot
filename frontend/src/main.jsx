/**
 * @file main.jsx
 * @description React 18 DOM mount entry point.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
