import { Bell, Building2, CreditCard, FileText, LayoutDashboard, LogOut, MessageSquare, ShieldCheck, Stethoscope, User, Users } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const roleHome = {
  admin: '/admin/dashboard',
  medecin: '/medecin/dashboard',
  patient: '/patient/dashboard',
  facturation: '/facturation/factures',
}

const navItems = {
  admin: [
    ['Dashboard', '/admin/dashboard', LayoutDashboard],
    ['Users', '/admin/users', User],
    ['Patients', '/admin/patients', Users],
    ['Medecins', '/admin/medecins', Stethoscope],
    ['Documents', '/admin/documents', FileText],
    ['Consultations', '/admin/consultations', Stethoscope],
    ['Permissions', '/admin/permissions', ShieldCheck],
    ['Services', '/admin/services', Building2],
    ['Factures', '/admin/factures', CreditCard],
    ['Messages', '/messages', MessageSquare],
    ['Notifications', '/notifications', Bell],
    ['Profil', '/profile', User],
  ],
  medecin: [
    ['Dashboard', '/medecin/dashboard', LayoutDashboard],
    ['Patients', '/medecin/patients', Users],
    ['Documents', '/medecin/documents', FileText],
    ['Consultations', '/medecin/consultations', Stethoscope],
    ['Notifications', '/notifications', Bell],
    ['Profil', '/profile', User],
  ],
  patient: [
    ['Dashboard', '/patient/dashboard', LayoutDashboard],
    ['Documents', '/patient/documents', FileText],
    ['Consultations', '/patient/consultations', Stethoscope],
    ['Factures', '/patient/factures', CreditCard],
    ['Messages', '/messages', MessageSquare],
    ['Notifications', '/notifications', Bell],
    ['Profil', '/profile', User],
  ],
  facturation: [
    ['Factures', '/facturation/factures', CreditCard],
    ['Services', '/facturation/services', Building2],
    ['Messages', '/messages', MessageSquare],
    ['Profil', '/profile', User],
  ],
}

export default function TopNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = navItems[user?.role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="top-navbar">
      <NavLink className="brand" to={roleHome[user?.role] || '/login'}>
        <span className="brand-mark">M</span>
        MedArchive
      </NavLink>
      <div className="nav-links">
        {items.map(([label, to, Icon]) => (
          <NavLink key={to} to={to}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button type="button" className="nav-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Deconnexion</span>
        </button>
      </div>
    </nav>
  )
}
