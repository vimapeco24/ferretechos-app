import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ServerSetup from './components/ServerSetup'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ServerSetup>
      <App />
    </ServerSetup>
  </React.StrictMode>
)

// Registrar Service Worker para PWA (iOS Safari + Android Chrome)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.log('SW error:', err))
  })
}
