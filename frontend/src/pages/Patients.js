import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'
import Badge from '../components/Badge'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

const empty = {
  id_user: '',
  ip_patient: '',
  cin: '',
  telephone: '',
  date_naissance: '',
  sexe: '',
  adresse: '',
  groupe_sanguin: '',
  contact_urgence: '',
}

export default function Patients() {
  const { user } = useAuth()
  const canManage = user?.role === 'admin'
  const [patients, setPatients] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [apiOffline, setApiOffline] = useState(false)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = () => {
    api
      .get('/patients')
      .then(({ data }) => {
        setApiOffline(false)
        setPatients(data.data || data)
      })
      .catch(() => setApiOffline(true))
  }

  useEffect(() => {
    load()
    api.get('/users?role=patient').then(({ data }) => setUsers(data.data || data)).catch(() => {})
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (editing) await api.put(`/patients/${editing.id_patient}`, form)
    else await api.post('/patients', form)
    setForm(null)
    setEditing(null)
    load()
  }

  const remove = async (patient) => {
    if (!confirm('Supprimer ce patient ?')) return
    await api.delete(`/patients/${patient.id_patient}`)
    load()
  }

  const filtered = patients.filter((patient) => {
    const value = `${patient.user?.nom_complet || ''} ${patient.ip_patient || ''} ${patient.cin || ''}`.toLowerCase()
    return value.includes(search.toLowerCase())
  })

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Gestion patients"
        title="Dossiers patients"
        description="Recherche, suivi et consultation des dossiers medicaux"
        action={canManage && <button className="main-btn" onClick={() => { setEditing(null); setForm(empty) }}><Plus size={18} />Ajouter</button>}
      />

      <section className="glass-card filters-bar">
        <div className="search-field">
          <Search size={18} />
          <input placeholder="Rechercher par nom, IP patient ou CIN" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </section>

      <section className="glass-card table-card">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>IP Patient</th>
              <th>CIN</th>
              <th>Telephone</th>
              <th>Groupe</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((patient) => (
              <tr key={patient.id_patient}>
                <td>
                  <div className="person-cell">
                    <span>{patient.user?.nom_complet?.slice(0, 2) || 'PT'}</span>
                    <strong>{patient.user?.nom_complet}</strong>
                  </div>
                </td>
                <td><strong>{patient.ip_patient || '-'}</strong></td>
                <td>{patient.cin}</td>
                <td>{patient.telephone || '-'}</td>
                <td>{patient.groupe_sanguin || '-'}</td>
                <td><Badge value="patient" /></td>
                <td className="actions-cell">
                  <button className="icon-btn"><Eye size={17} /></button>
                  {canManage && <button className="icon-btn" onClick={() => { setEditing(patient); setForm(patient) }}><Edit size={17} /></button>}
                  {canManage && <button className="icon-btn danger" onClick={() => remove(patient)}><Trash2 size={17} /></button>}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    {apiOffline ? 'Backend indisponible.' : 'Aucun patient trouve.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {form && (
        <CrudModal title={editing ? 'Modifier patient' : 'Ajouter patient'} onClose={() => setForm(null)} onSubmit={submit}>
          {!editing && <FormField label="Utilisateur patient"><select value={form.id_user} onChange={(e) => setForm({ ...form, id_user: e.target.value })} required><option value="">Choisir</option>{users.map((user) => <option key={user.id_user} value={user.id_user}>{user.nom_complet}</option>)}</select></FormField>}
          <FormField label="IP patient"><input value={form.ip_patient || ''} onChange={(e) => setForm({ ...form, ip_patient: e.target.value })} required /></FormField>
          <FormField label="CIN"><input value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} required /></FormField>
          <FormField label="Telephone"><input value={form.telephone || ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></FormField>
          <FormField label="Date naissance"><input type="date" value={form.date_naissance?.slice(0, 10) || ''} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} /></FormField>
          <FormField label="Sexe"><select value={form.sexe || ''} onChange={(e) => setForm({ ...form, sexe: e.target.value })}><option value="">Choisir</option><option value="homme">Homme</option><option value="femme">Femme</option></select></FormField>
          <FormField label="Adresse"><input value={form.adresse || ''} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></FormField>
          <FormField label="Groupe sanguin"><input value={form.groupe_sanguin || ''} onChange={(e) => setForm({ ...form, groupe_sanguin: e.target.value })} /></FormField>
          <FormField label="Contact urgence"><input value={form.contact_urgence || ''} onChange={(e) => setForm({ ...form, contact_urgence: e.target.value })} /></FormField>
        </CrudModal>
      )}
    </div>
  )
}
