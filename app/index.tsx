import React from 'react'
import { render } from 'react-dom'
import './index.scss'
import App from './src/App'

render(<App />, document.getElementById('app') || document.createElement('div'))
