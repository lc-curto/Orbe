import React from 'react'
import ReactDOM from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import App from './App'
import { tamaguiConfig } from './tamagui.config'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <App />
    </TamaguiProvider>
  </React.StrictMode>,
)
