import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { supabaseConfigReady } from './lib/supabase.js'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

if (!supabaseConfigReady) {
  root.render(
    <main style={{ maxWidth: 640, margin: '15vh auto', padding: 32, fontFamily: 'Arial, sans-serif', color: '#0F172A' }}>
      <h1>Приложение не настроено</h1>
      <p>Не удалось загрузить настройки подключения. Обновите публикацию проекта и попробуйте снова.</p>
    </main>,
  )
} else {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
}
