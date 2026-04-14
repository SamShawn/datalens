import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './components/Layout/Dashboard'

function App() {
  const path = window.location.pathname

  if (path === '/login') {
    return <LoginPage />
  }

  if (path === '/register') {
    return <RegisterPage />
  }

  if (path === '/dashboard') {
    return <Dashboard />
  }

  // Default to login
  window.location.href = '/login'
  return null
}

export default App
