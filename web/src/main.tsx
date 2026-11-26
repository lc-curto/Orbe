import React from 'react'
import ReactDOM from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import App from './app/App'
import { tamaguiConfig } from './tamagui.config'
import { AuthProvider } from './api/AuthProvider'
import { CurrencyProvider } from './features/currency/CurrencyProvider'
import { ThemeProvider } from './features/theme/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </TamaguiProvider>
  </React.StrictMode>,
)
