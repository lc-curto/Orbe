import React from 'react'
import ReactDOM from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import App from './App'
import { tamaguiConfig } from './tamagui.config'
import { AuthProvider } from './api/AuthProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <AuthProvider>
        <App />
      </AuthProvider>
    </TamaguiProvider>
  </React.StrictMode>,
)
