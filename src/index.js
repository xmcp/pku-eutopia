import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './ui/App';

import './index.css';

window.EUTOPIA_RENDER_ROOT = window.EUTOPIA_USE_MOCK ?
    document.getElementById('eu-root') :
    document.getElementById('eutopia-mount-point').shadowRoot.getElementById('eu-root');

const root = ReactDOM.createRoot(window.EUTOPIA_RENDER_ROOT);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
