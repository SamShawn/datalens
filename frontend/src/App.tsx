import { AuthProvider } from './components/AuthProvider'
import { useSession } from 'next-auth/react'

function App() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="loading">Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="app">
        <h1>LuxTerminal</h1>
      </div>
    </AuthProvider>
  )
}

export default App