import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Homepage from '../pages/Homepage'
import Footer from '../components/Footer'
import Login from '../pages/Login'
import ForgotPassword from '../pages/ForgotPassword'
import Register from '../pages/Register'
import ResetPassword from '../pages/ResetPassword'
import GoogleAuthCallback from '../pages/GoogleAuthCallback'
import Admin from '../pages/Admin'
import Manager from '@/pages/roles/Manager'
import ProfilePage from '@/pages/Profile'
import AdminDashboard from '@/pages/roles/Admin/Dashboard'
import AdminUsers from '@/pages/roles/Admin/Users'
import AdminTeams from '@/pages/roles/Admin/Teams'
import AdminDepartments from '@/pages/roles/Admin/Departments'
import AdminTaskTypes from '@/pages/roles/Admin/TaskTypes'

function isAdminRoute(route: string) {
  return route.startsWith('#/admin')
}

function isRoleAdminRoute(route: string) {
  return route.startsWith('#/roles/admin')
}

function isRoleManagerRoute(route: string) {
  return route.startsWith('#/roles/manager') || route.startsWith('#/manager')
}

function AdminRoute({ route }: { route: string }) {
  if (route.startsWith('#/admin/user-management')) {
    return <Admin initialTab="user-management" />
  }

  if (route.startsWith('#/admin/profile')) {
    return <Admin initialTab="profile" />
  }

  return <Admin />
}

export default function AppRouter() {
  const [route, setRoute] = useState<string>(window.location.hash || '#/')
  const [pathname, setPathname] = useState<string>(window.location.pathname)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    const onPathChange = () => setPathname(window.location.pathname)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onPathChange)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onPathChange)
    }
  }, [])

  if (pathname.startsWith('/auth/callback')) {
    return <GoogleAuthCallback />
  }

  if (isAdminRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = '#/login'
      return null
    }

    // Only Admin users may access /admin area
    if (user?.roleName?.toUpperCase() !== 'ADMIN') {
      window.location.hash = '#/'
      return null
    }

    return <AdminRoute route={route} />
  }

  if (isRoleAdminRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = '#/login'
      return null
    }

    if (user?.roleName?.toUpperCase() !== 'ADMIN') {
      window.location.hash = '#/'
      return null
    }

    if (route.startsWith('#/roles/admin/users')) return <AdminUsers />
    if (route.startsWith('#/roles/admin/departments')) return <AdminDepartments />
    if (route.startsWith('#/roles/admin/task-types')) return <AdminTaskTypes />
    if (route.startsWith('#/roles/admin/teams')) return <AdminTeams />
    return <AdminDashboard />
  }

  if (isRoleManagerRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = '#/login'
      return null
    }

    return <Manager />
  }

  // Generic profile route accessible to any authenticated user
  if (route.startsWith('#/profile')) {
    if (!isAuthenticated) {
      window.location.hash = '#/login'
      return null
    }

    return <ProfilePage />
  }

  if (route.startsWith('#/login')) {
    return <Login />
  }

  if (route.startsWith('#/forgot-password')) {
    return <ForgotPassword />
  }

  if (route.startsWith('#/reset-password')) {
    return <ResetPassword />
  }

  if (route.startsWith('#/register')) {
    return <Register />
  }

  return (
    <>
      <Homepage />
      <Footer />
    </>
  )
}
