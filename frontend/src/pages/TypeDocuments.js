import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import { useCrud } from '../hooks/useCrud'

const empty = { nom_type: '', description: '' }

export default function TypeDocuments() {
  const { items, error, reload } = useCrud('/types-documents')
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    if (editing) await api.put(`/types-documents/${editing.id_type}`, form)
    else await api.post('/types-documents', form)
    await reload()
    setForm(null)
    setEditing(null)
  }

  const remove = async (item) => {
    if (!confirm('Supprimer ce type ?')) return
    await api.delete(`/types-documents/${item.id_type}`)
    reload()
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Configuration" title="Types documents" description="Categories des documents medicaux" action={<button className="main-btn" onClick={() => { setEditing(null); setForm(empty) }}><Plus size={18} />Ajouter</button>} />
      <section className="glass-card table-card">
        <table>
          <thead><tr><th>Type</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length ? items.map((item) => (
              <tr key={item.id_type}><td><strong>{item.nom_type}</strong></td><td>{item.description || '-'}</td><td className="actions-cell"><button className="icon-btn" onClick={() => { setEditing(item); setForm(item) }}><Edit size={16} /></button><button className="icon-btn danger" onClick={() => remove(item)}><Trash2 size={16} /></button></td></tr>
            )) : <tr><td colSpan="3"><div className="empty-state">{error || 'Aucun type trouve.'}</div></td></tr>}
          </tbody>
        </table>
      </section>
      {form && <CrudModal title={editing ? 'Modifier type' : 'Ajouter type'} onClose={() => setForm(null)} onSubmit={submit}><FormField label="Nom type"><input value={form.nom_type} onChange={(e) => setForm({ ...form, nom_type: e.target.value })} required /></FormField><FormField label="Description"><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField></CrudModal>}
    </div>
  )
}
