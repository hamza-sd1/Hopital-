import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import medarchiveLogo from '../../assets/medarchive-logo.png'

const rolePath = {
  admin: '/admin/dashboard',
  medecin: '/medecin/dashboard',
  patient: '/patient/dashboard',
  facturation: '/facturation/factures',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@medarchive.test', password: 'password' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = await login(form)
      navigate(rolePath[user.role] || '/profile')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Backend Laravel indisponible. Lancez d'abord php artisan serve --host=127.0.0.1 --port=8000.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card glass-card">
        <div className="login-card-intro">
          <img className="login-brand-logo" src={medarchiveLogo} alt="MedArchive" />
          <span className="eyebrow">Portail medical securise</span>
          <h1>Connexion</h1>
          <p>Acces reserve aux equipes autorisees pour consulter et gerer les dossiers medicaux.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-stack login-form-panel">
          <label className="auth-field">
            <span>Email professionnel</span>
            <div className="auth-input">
              <Mail size={18} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>
          </label>
          <label className="auth-field">
            <span>Mot de passe</span>
            <div className="auth-input">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="main-btn login-submit" type="submit" disabled={submitting}>
            <LogIn size={18} />
            <span>{submitting ? 'Connexion...' : 'Se connecter'}</span>
          </button>
        </form>
      </section>
    </main>
  )
}
