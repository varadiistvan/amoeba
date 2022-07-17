import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App style={{height: "100%", width: "100%", position: 'absolute', margin: 0, left: 0, top: 0, overflow: 'hidden'}} />
  </React.StrictMode>
);