import { hydrateRoot } from 'react-dom/client'
import App from './App'

hydrateRoot( document.getElementById('app') as HTMLElement, <App />)