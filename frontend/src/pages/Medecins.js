import { Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import { useCrud } from '../hooks/useCrud'

const empty = { id_user: '', id_service: '', specialite: '', numero_bureau: '', telephone_professionnel: '' }

export default function Medecins() {
  const { items, error, reload } = useCrud('/medecins')
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    api.get('/users?role=medecin').then(({ data }) => setUsers(data.data || data)).catch(() => {})
    api.get('/services').then(({ data }) => setServices(data.data || data)).catch(() => {})
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (editing) await api.put(`/medecins/${editing.id_medecin}`, form)
    else await api.post('/medecins', form)
    await reload()
    setForm(null)
    setEditing(null)
  }

  const remove = async (item) => {
    if (!confirm('Supprimer ce medecin ?')) return
    await api.delete(`/medecins/${item.id_medecin}`)
    reload()
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Administration" title="Medecins" description="Gestion des profils medecins et specialites" action={<button className="main-btn" onClick={() => { setEditing(null); setForm(empty) }}><Plus size={18} />Ajouter</button>} />
      <section className="glass-card table-card">
        <table>
          <thead><tr><th>Medecin</th><th>Service</th><th>Specialite</th><th>Bureau</th><th>Telephone</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length ? items.map((item) => (
              <tr key={item.id_medecin}>
                <td><strong>{item.user?.nom_complet}</strong></td>
                <td>{item.service?.nom_service || '-'}</td>
                <td>{item.specialite}</td>
                <td>{item.numero_bureau || '-'}</td>
                <td>{item.telephone_professionnel || '-'}</td>
                <td className="actions-cell"><button className="icon-btn" onClick={() => { setEditing(item); setForm(item) }}><Edit size={16} /></button><button className="icon-btn danger" onClick={() => remove(item)}><Trash2 size={16} /></button></td>
              </tr>
            )) : <tr><td colSpan="6"><div className="empty-state">{error || 'Aucun medecin trouve.'}</div></td></tr>}
          </tbody>
        </table>
      </section>
      {form && (
        <CrudModal title={editing ? 'Modifier medecin' : 'Ajouter medecin'} onClose={() => setForm(null)} onSubmit={submit}>
          {!editing && <FormField label="Utilisateur medecin"><select value={form.id_user} onChange={(e) => setForm({ ...form, id_user: e.target.value })} required><option value="">Choisir</option>{users.map((user) => <option key={user.id_user} value={user.id_user}>{user.nom_complet}</option>)}</select></FormField>}
          <FormField label="Service"><select value={form.id_service || ''} onChange={(e) => setForm({ ...form, id_service: e.target.value })}><option value="">Aucun service</option>{services.map((service) => <option key={service.id_service} value={service.id_service}>{service.nom_service}</option>)}</select></FormField>
          <FormField label="Specialite"><input value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} required /></FormField>
          <FormField label="Numero bureau"><input value={form.numero_bureau || ''} onChange={(e) => setForm({ ...form, numero_bureau: e.target.value })} /></FormField>
          <FormField label="Telephone professionnel"><input value={form.telephone_professionnel || ''} onChange={(e) => setForm({ ...form, telephone_professionnel: e.target.value })} /></FormField>
        </CrudModal>
      )}
    </div>
  )
}
