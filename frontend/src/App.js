import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import Login from './pages/auth/Login'
import Consultations from './pages/Consultations'
import Activites from './pages/Activites'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Factures from './pages/Factures'
import Medecins from './pages/Medecins'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import PatientRecord from './pages/PatientRecord'
import Patients from './pages/Patients'
import Profile from './pages/Profile'
import Services from './pages/Services'
import SimplePage from './pages/SimplePage'
import TypeDocuments from './pages/TypeDocuments'
import Users from './pages/Users'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute roles={['admin', 'medecin', 'patient', 'facturation']} />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/unauthorized" element={<SimplePage title="Acces refuse" description="Vous n'avez pas l'autorisation d'acceder a cette page." />} />

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<Dashboard role="admin" />} />
            <Route path="/admin/patients" element={<Patients />} />
            <Route path="/admin/patients/:id" element={<PatientRecord />} />
            <Route path="/admin/documents" element={<Documents />} />
            <Route path="/admin/consultations" element={<Consultations />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/medecins" element={<Medecins />} />
            <Route path="/admin/types-documents" element={<TypeDocuments />} />
            <Route path="/admin/activites" element={<Activites />} />
            <Route path="/admin/services" element={<Services />} />
            <Route path="/admin/factures" element={<Factures />} />
          </Route>

          <Route element={<ProtectedRoute roles={['medecin']} />}>
            <Route path="/medecin/dashboard" element={<Dashboard role="medecin" />} />
            <Route path="/medecin/patients" element={<Patients />} />
            <Route path="/medecin/patients/:id" element={<PatientRecord />} />
            <Route path="/medecin/documents" element={<Documents />} />
            <Route path="/medecin/consultations" element={<Consultations />} />
          </Route>

          <Route element={<ProtectedRoute roles={['patient']} />}>
            <Route path="/patient/dashboard" element={<Dashboard role="patient" />} />
            <Route path="/patient/documents" element={<Documents />} />
            <Route path="/patient/consultations" element={<Consultations />} />
            <Route path="/patient/factures" element={<Factures />} />
          </Route>

          <Route element={<ProtectedRoute roles={['facturation']} />}>
            <Route path="/facturation/factures" element={<Factures />} />
            <Route path="/facturation/services" element={<Services />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<SimplePage title="Page introuvable" description="La page demandee n'existe pas." />} />
    </Routes>
  )
}
