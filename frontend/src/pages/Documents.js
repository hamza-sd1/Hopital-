import { Download, Edit, Eye, FilePlus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'
import Badge from '../components/Badge'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

const empty = { id_patient: '', id_medecin: '', id_consultation: '', id_type: '', titre: '', description: '', statut: 'actif', fichier: null }

export default function Documents() {
  const { user } = useAuth()
  const canManage = ['admin', 'medecin'].includes(user?.role)
  const [documents, setDocuments] = useState([])
  const [patients, setPatients] = useState([])
  const [medecins, setMedecins] = useState([])
  const [consultations, setConsultations] = useState([])
  const [types, setTypes] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [apiOffline, setApiOffline] = useState(false)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = () => {
    api
      .get('/documents')
      .then(({ data }) => {
        setApiOffline(false)
        setDocuments(data.data || data)
      })
      .catch(() => setApiOffline(true))
  }

  useEffect(() => {
    load()
    if (canManage) {
      api.get('/patients').then(({ data }) => setPatients(data.data || data)).catch(() => {})
      api.get('/medecins').then(({ data }) => setMedecins(data.data || data)).catch(() => {})
      api.get('/consultations').then(({ data }) => setConsultations(data.data || data)).catch(() => {})
      api.get('/types-documents').then(({ data }) => setTypes(data.data || data)).catch(() => {})
    }
  }, [canManage])

  const typeOptions = types.length
    ? types
    : documents
      .filter((document) => document.type?.id_type)
      .map((document) => document.type)
      .filter((type, index, current) => current.findIndex((item) => item.id_type === type.id_type) === index)

  const filtered = documents.filter((document) => {
    const matchesSearch = document.titre?.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter || String(document.id_type || document.type?.id_type) === typeFilter
    const matchesStatus = !statusFilter || document.statut === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const download = async (document) => {
    const { data } = await api.get(`/documents/${document.id_document}/download`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(data)
    const link = window.document.createElement('a')
    link.href = url
    link.download = document.nom_fichier || `${document.titre}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  const preview = async (document) => {
    const { data } = await api.get(`/documents/${document.id_document}/preview`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(data)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (editing) {
      await api.put(`/documents/${editing.id_document}`, {
        id_type: form.id_type,
        titre: form.titre,
        description: form.description,
        statut: form.statut,
      })
    } else {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null) data.append(key, value)
      })
      await api.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    setForm(null)
    setEditing(null)
    load()
  }

  const remove = async (document) => {
    if (!confirm('Supprimer ce document ?')) return
    await api.delete(`/documents/${document.id_document}`)
    load()
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Gestion documents"
        title="Documents medicaux"
        description="Classement, suivi et archivage des documents medicaux"
        action={canManage && <button className="main-btn" onClick={() => { setEditing(null); setForm(empty) }}><FilePlus size={18} />Ajouter</button>}
      />

      <section className="glass-card filters-bar">
        <div className="search-field">
          <Search size={18} />
          <input placeholder="Recherche document" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="">Tous les types</option>
          {typeOptions.map((type) => (
            <option key={type.id_type} value={type.id_type}>{type.nom_type}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="archive">Archive</option>
        </select>
      </section>

      <section className="glass-card table-card">
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Patient</th>
              <th>IP Patient</th>
              <th>Type</th>
              <th>Date upload</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((document) => (
              <tr key={document.id_document}>
                <td><strong>{document.titre}</strong></td>
                <td>{document.patient?.user?.nom_complet || '-'}</td>
                <td>{document.patient?.ip_patient || '-'}</td>
                <td>{document.type?.nom_type || '-'}</td>
                <td>{document.date_upload?.slice(0, 10) || '-'}</td>
                <td><Badge value={document.statut} /></td>
                <td className="actions-cell">
                  <button className="icon-btn" title="Voir le document" onClick={() => preview(document)}><Eye size={17} /></button>
                  <button className="icon-btn" title="Telecharger" onClick={() => download(document)}><Download size={17} /></button>
                  {canManage && <button className="icon-btn" onClick={() => { setEditing(document); setForm(document) }}><Edit size={17} /></button>}
                  {canManage && <button className="icon-btn danger" onClick={() => remove(document)}><Trash2 size={17} /></button>}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    {apiOffline ? 'Backend indisponible.' : 'Aucun document trouve.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {form && (
        <CrudModal title={editing ? 'Modifier document' : 'Ajouter document'} onClose={() => setForm(null)} onSubmit={submit}>
          {!editing && <FormField label="Patient"><select value={form.id_patient} onChange={(e) => setForm({ ...form, id_patient: e.target.value })} required><option value="">Choisir</option>{patients.map((p) => <option key={p.id_patient} value={p.id_patient}>{p.user?.nom_complet}</option>)}</select></FormField>}
          {!editing && <FormField label="Medecin"><select value={form.id_medecin || ''} onChange={(e) => setForm({ ...form, id_medecin: e.target.value })}><option value="">Optionnel</option>{medecins.map((m) => <option key={m.id_medecin} value={m.id_medecin}>{m.user?.nom_complet}</option>)}</select></FormField>}
          {!editing && <FormField label="Consultation"><select value={form.id_consultation || ''} onChange={(e) => setForm({ ...form, id_consultation: e.target.value })}><option value="">Optionnel</option>{consultations.map((c) => <option key={c.id_consultation} value={c.id_consultation}>{c.patient?.user?.nom_complet} - {c.date_consultation?.slice(0, 10)}</option>)}</select></FormField>}
          <FormField label="Type"><select value={form.id_type} onChange={(e) => setForm({ ...form, id_type: e.target.value })} required><option value="">Choisir</option>{types.map((t) => <option key={t.id_type} value={t.id_type}>{t.nom_type}</option>)}</select></FormField>
          <FormField label="Titre"><input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required /></FormField>
          <FormField label="Description"><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Statut"><select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}><option value="actif">Actif</option><option value="archive">Archive</option></select></FormField>
          {!editing && <FormField label="Fichier PDF/Image"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm({ ...form, fichier: e.target.files[0] })} required /></FormField>}
        </CrudModal>
      )}
    </div>
  )
}
