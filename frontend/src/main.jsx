import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './utils/motion.js'
import { initChartTheme } from './utils/chartTheme.js'
import { PALETTE_STORAGE_KEY } from './components/PalettePicker.jsx'

// Apply the colour palette before the first render so there is no flash of the wrong colours
document.documentElement.dataset.palette = localStorage.getItem(PALETTE_STORAGE_KEY) || 'navy'
initChartTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
