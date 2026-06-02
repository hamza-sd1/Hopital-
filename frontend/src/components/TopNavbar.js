import { Bell, Building2, CreditCard, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, Stethoscope, User, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import medarchiveLogo from '../assets/medarchive-logo.png'

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
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const items = navItems[user?.role] || []
  const activeItem = items.find(([, to]) => location.pathname === to || location.pathname.startsWith(`${to}/`))
  const pageTitle = activeItem?.[0] || 'MedArchive'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <header className="top-navbar">
        <button type="button" className="mobile-menu-btn" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
          <Menu size={20} />
        </button>
        <div className="page-title-block">
          <span>{user?.role || 'espace medical'}</span>
          <h1>{pageTitle}</h1>
        </div>
        <div className="user-area">
          <div className="user-chip">
            <span>{user?.nom_complet?.slice(0, 2) || 'MA'}</span>
            <div>
              <strong>{user?.nom_complet || 'MedArchive'}</strong>
              <small>{user?.role || 'Utilisateur'}</small>
            </div>
          </div>
          <button type="button" className="nav-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Deconnexion</span>
          </button>
        </div>
      </header>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-head">
          <NavLink className="brand" to={roleHome[user?.role] || '/login'} onClick={() => setOpen(false)}>
            <img className="brand-logo" src={medarchiveLogo} alt="MedArchive" />
          </NavLink>
          <button type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label="Fermer le menu">
            <X size={20} />
          </button>
        </div>
        <nav className="nav-links" aria-label="Navigation principale">
          {items.map(([label, to, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Systeme hospitalier</span>
          <strong>Archives medicales securisees</strong>
        </div>
      </aside>
      {open && <button type="button" className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Fermer le menu" />}
    </>
  )
}
