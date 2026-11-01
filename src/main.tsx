import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// 앱을 화면(root)에 붙이는 시작 파일입니다.
// BrowserRouter: 주소(URL)에 따라 다른 화면을 보여줄 수 있게 해 줍니다.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
