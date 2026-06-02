import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'
import Badge from '../components/Badge'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import { useCrud } from '../hooks/useCrud'

const empty = { nom_service: '', description: '', telephone: '', emplacement: '', statut: 'actif' }

export default function Services() {
  const { items, error, reload } = useCrud('/services')
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    if (editing) await api.put(`/services/${editing.id_service}`, form)
    else await api.post('/services', form)
    setForm(null)
    setEditing(null)
    reload()
  }

  const remove = async (service) => {
    if (!confirm('Supprimer ce service ?')) return
    await api.delete(`/services/${service.id_service}`)
    reload()
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Hopital" title="Services hospitaliers" description="Gestion des services et emplacements hospitaliers" action={<button className="main-btn" onClick={() => { setEditing(null); setForm(empty) }}><Plus size={18} />Ajouter</button>} />
      <section className="glass-card table-card">
        <table>
          <thead><tr><th>Service</th><th>Telephone</th><th>Emplacement</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length ? items.map((service) => (
              <tr key={service.id_service}>
                <td><strong>{service.nom_service}</strong><p className="muted">{service.description}</p></td>
                <td>{service.telephone || '-'}</td>
                <td>{service.emplacement || '-'}</td>
                <td><Badge value={service.statut} /></td>
                <td className="actions-cell"><button className="icon-btn" onClick={() => { setEditing(service); setForm(service) }}><Edit size={16} /></button><button className="icon-btn danger" onClick={() => remove(service)}><Trash2 size={16} /></button></td>
              </tr>
            )) : <tr><td colSpan="5"><div className="empty-state">{error || 'Aucun service.'}</div></td></tr>}
          </tbody>
        </table>
      </section>
      {form && <CrudModal title={editing ? 'Modifier service' : 'Ajouter service'} onClose={() => setForm(null)} onSubmit={submit}>
        <FormField label="Nom service"><input value={form.nom_service} onChange={(e) => setForm({ ...form, nom_service: e.target.value })} required /></FormField>
        <FormField label="Telephone"><input value={form.telephone || ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></FormField>
        <FormField label="Emplacement"><input value={form.emplacement || ''} onChange={(e) => setForm({ ...form, emplacement: e.target.value })} /></FormField>
        <FormField label="Statut"><select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}><option value="actif">Actif</option><option value="inactif">Inactif</option></select></FormField>
        <FormField label="Description"><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
      </CrudModal>}
    </div>
  )
}
