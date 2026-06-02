import { Edit, KeyRound, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'
import Badge from '../components/Badge'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import { useCrud } from '../hooks/useCrud'

const emptyUser = { nom_complet: '', email: '', password: '', role: 'patient', statut: 'actif' }

export default function Users() {
  const { items: users, error, reload } = useCrud('/users')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ password: '', password_confirmation: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setFormError('')
    setForm({ ...emptyUser })
  }

  const openEdit = (user) => {
    setEditing(user)
    setFormError('')
    setForm({ ...user, password: '' })
  }

  const openPassword = (user) => {
    setPasswordTarget(user)
    setPasswordForm({ password: '', password_confirmation: '' })
    setFormError('')
  }

  const close = () => {
    setEditing(null)
    setForm(null)
    setPasswordTarget(null)
    setPasswordForm({ password: '', password_confirmation: '' })
    setFormError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    const payload = { ...form }
    if (!payload.password) delete payload.password

    try {
      if (editing) {
        await api.put(`/users/${editing.id_user}`, payload)
      } else {
        await api.post('/users', payload)
      }
      await reload()
      close()
    } catch (err) {
      const errors = err.response?.data?.errors
      setFormError(errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message || "Impossible d'enregistrer l'utilisateur.")
    } finally {
      setSubmitting(false)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setFormError('')

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setFormError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)

    try {
      await api.put(`/users/${passwordTarget.id_user}`, { password: passwordForm.password })
      await reload()
      close()
    } catch (err) {
      const errors = err.response?.data?.errors
      setFormError(errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message || 'Impossible de changer le mot de passe.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (user) => {
    if (!confirm(`Supprimer ${user.nom_complet} ?`)) return
    await api.delete(`/users/${user.id_user}`)
    reload()
  }

  const filtered = users.filter((user) => `${user.nom_complet} ${user.email}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Administration"
        title="Utilisateurs"
        description="Gestion des comptes, roles et statuts"
        action={<button className="main-btn" onClick={openCreate}><Plus size={18} />Ajouter</button>}
      />
      <section className="glass-card filters-bar">
        <div className="search-field"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher utilisateur" /></div>
      </section>
      <section className="glass-card table-card">
        <table>
          <thead><tr><th>Nom</th><th>Email</th><th>Role</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map((user) => (
              <tr key={user.id_user}>
                <td><strong>{user.nom_complet}</strong></td>
                <td>{user.email}</td>
                <td><Badge value={user.role} /></td>
                <td><Badge value={user.statut} /></td>
                <td className="actions-cell">
                  <button className="icon-btn" onClick={() => openEdit(user)}><Edit size={16} /></button>
                  <button className="icon-btn" title="Changer le mot de passe" onClick={() => openPassword(user)}><KeyRound size={16} /></button>
                  <button className="icon-btn danger" onClick={() => remove(user)}><Trash2 size={16} /></button>
                </td>
              </tr>
            )) : <tr><td colSpan="5"><div className="empty-state">{error || 'Aucun utilisateur trouve.'}</div></td></tr>}
          </tbody>
        </table>
      </section>
      {form && (
        <CrudModal title={editing ? 'Modifier utilisateur' : 'Ajouter utilisateur'} onClose={close} onSubmit={submit} submitting={submitting}>
          <FormField label="Nom complet"><input value={form.nom_complet} onChange={(e) => setForm({ ...form, nom_complet: e.target.value })} required /></FormField>
          <FormField label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></FormField>
          {!editing && <FormField label="Mot de passe"><input type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength="8" required /></FormField>}
          <FormField label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="admin">Admin</option><option value="medecin">Medecin</option><option value="patient">Patient</option><option value="facturation">Facturation</option></select></FormField>
          <FormField label="Statut"><select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}><option value="actif">Actif</option><option value="inactif">Inactif</option></select></FormField>
          {formError && <div className="form-error modal-form-error">{formError}</div>}
        </CrudModal>
      )}
      {passwordTarget && (
        <CrudModal title={`Changer mot de passe - ${passwordTarget.nom_complet}`} onClose={close} onSubmit={submitPassword} submitting={submitting}>
          <FormField label="Nouveau mot de passe">
            <input
              type="password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              minLength="8"
              required
            />
          </FormField>
          <FormField label="Confirmer le mot de passe">
            <input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
              minLength="8"
              required
            />
          </FormField>
          {formError && <div className="form-error modal-form-error">{formError}</div>}
        </CrudModal>
      )}
    </div>
  )
}
