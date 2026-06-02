import { KeyRound, Mail, Shield, UserRound } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'
import Badge from '../components/Badge'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

export default function Profile() {
  const { user } = useAuth()
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitPassword = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)

    try {
      const { data } = await api.post('/change-password', passwordForm)
      setMessage(data.message || 'Mot de passe modifie avec succes.')
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message || 'Impossible de modifier le mot de passe.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Compte utilisateur"
        title="Profil"
        description="Informations du compte connecte et role dans MedArchive"
      />
      <section className="profile-card glass-card">
        <div className="profile-avatar">{user?.nom_complet?.slice(0, 2) || 'MA'}</div>
        <div>
          <h2>{user?.nom_complet}</h2>
          <p><Mail size={16} />{user?.email}</p>
          <p><Shield size={16} /> <Badge value={user?.role} /></p>
          <p><UserRound size={16} /> Statut : {user?.statut}</p>
        </div>
      </section>

      <section className="glass-card panel profile-password-panel">
        <div className="panel-title">
          <div>
            <h2>Changer mon mot de passe</h2>
            <span>Protegez votre compte avec un mot de passe personnel.</span>
          </div>
          <span className="activity-dot"><KeyRound size={17} /></span>
        </div>
        <form className="form-grid" onSubmit={submitPassword}>
          <FormField label="Mot de passe actuel">
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
              required
            />
          </FormField>
          <FormField label="Nouveau mot de passe">
            <input
              type="password"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
              minLength="8"
              required
            />
          </FormField>
          <FormField label="Confirmer le nouveau mot de passe">
            <input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={(event) => setPasswordForm({ ...passwordForm, password_confirmation: event.target.value })}
              minLength="8"
              required
            />
          </FormField>
          {error && <div className="form-error modal-form-error">{error}</div>}
          {message && <div className="form-success modal-form-error">{message}</div>}
          <div className="modal-actions">
            <button className="main-btn" type="submit" disabled={submitting}>
              {submitting ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
