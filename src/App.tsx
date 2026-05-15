import { useEffect, useState } from 'react'
import Homepage from './pages/Homepage'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [route, setRoute] = useState<string>(window.location.hash || '#/')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Protect admin route
  if (route.startsWith('#/admin')) {
    if (!isAuthenticated) {
      window.location.hash = '#/login'
      return null
    }
    return <Admin />
  }

  if (route.startsWith('#/login')) {
    return <Login />
  }

  if (route.startsWith('#/register')) {
    return <Register />
  }

  return (
    <>
      {/* Integrated Landing Page */}
      <Homepage />
      
      {/* Footer */}
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
