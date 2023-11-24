import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// @ts-ignore
import Timer from './Timer'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Timer />
  </React.StrictMode>,
)
