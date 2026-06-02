import { CalendarDays, Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

const empty = { id_patient: '', id_medecin: '', id_service: '', date_consultation: '', diagnostic: '', notes: '', traitement: '' }

export default function Consultations() {
  const { user } = useAuth()
  const canManage = ['admin', 'medecin'].includes(user?.role)
  const [consultations, setConsultations] = useState([])
  const [patients, setPatients] = useState([])
  const [medecins, setMedecins] = useState([])
  const [services, setServices] = useState([])
  const [apiOffline, setApiOffline] = useState(false)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = () => {
    api
      .get('/consultations')
      .then(({ data }) => {
        setApiOffline(false)
        setConsultations(data.data || data)
      })
      .catch(() => setApiOffline(true))
  }

  useEffect(() => {
    load()
    if (canManage) {
      api.get('/patients').then(({ data }) => setPatients(data.data || data)).catch(() => {})
      api.get('/medecins').then(({ data }) => setMedecins(data.data || data)).catch(() => {})
      api.get('/services').then(({ data }) => setServices(data.data || data)).catch(() => {})
    }
  }, [canManage])

  const submit = async (event) => {
    event.preventDefault()
    if (editing) await api.put(`/consultations/${editing.id_consultation}`, form)
    else await api.post('/consultations', form)
    setForm(null)
    setEditing(null)
    load()
  }

  const remove = async (consultation) => {
    if (!confirm('Supprimer cette consultation ?')) return
    await api.delete(`/consultations/${consultation.id_consultation}`)
    load()
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Consultations"
        title="Timeline medicale"
        description="Historique clinique, diagnostics et traitements"
        action={canManage && <button className="main-btn" onClick={() => { setEditing(null); setForm(empty) }}><Plus size={18} />Ajouter</button>}
      />

      <section className="timeline">
        {consultations.length ? consultations.map((consultation) => (
          <article className="timeline-card glass-card" key={consultation.id_consultation}>
            <div className="timeline-date">
              <CalendarDays size={16} />
              {consultation.date_consultation?.slice(0, 16)}
            </div>
            <h2>{consultation.patient?.user?.nom_complet || 'Patient'}</h2>
            <p className="muted">
              IP patient {consultation.patient?.ip_patient || '-'} - {consultation.medecin?.user?.nom_complet || 'Medecin'}
              {consultation.service?.nom_service ? ` - ${consultation.service.nom_service}` : ''}
            </p>
            <div className="consultation-body">
              <div>
                <span>Diagnostic</span>
                <strong>{consultation.diagnostic || '-'}</strong>
              </div>
              <div>
                <span>Traitement</span>
                <strong>{consultation.traitement || '-'}</strong>
              </div>
            </div>
            {canManage && (
              <div className="card-actions">
                <button className="icon-btn" onClick={() => { setEditing(consultation); setForm({ ...consultation, date_consultation: consultation.date_consultation?.slice(0, 16) || '' }) }}><Edit size={16} /></button>
                <button className="icon-btn danger" onClick={() => remove(consultation)}><Trash2 size={16} /></button>
              </div>
            )}
          </article>
        )) : (
          <div className="empty-state glass-card">
            {apiOffline ? 'Backend indisponible.' : 'Aucune consultation disponible.'}
          </div>
        )}
      </section>
      {form && (
        <CrudModal title={editing ? 'Modifier consultation' : 'Ajouter consultation'} onClose={() => setForm(null)} onSubmit={submit}>
          {!editing && <FormField label="Patient"><select value={form.id_patient} onChange={(e) => setForm({ ...form, id_patient: e.target.value })} required><option value="">Choisir</option>{patients.map((p) => <option key={p.id_patient} value={p.id_patient}>{p.user?.nom_complet}</option>)}</select></FormField>}
          {!editing && <FormField label="Medecin"><select value={form.id_medecin} onChange={(e) => setForm({ ...form, id_medecin: e.target.value })} required><option value="">Choisir</option>{medecins.map((m) => <option key={m.id_medecin} value={m.id_medecin}>{m.user?.nom_complet}</option>)}</select></FormField>}
          <FormField label="Service"><select value={form.id_service || ''} onChange={(e) => setForm({ ...form, id_service: e.target.value })}><option value="">Aucun service</option>{services.map((service) => <option key={service.id_service} value={service.id_service}>{service.nom_service}</option>)}</select></FormField>
          <FormField label="Date consultation"><input type="datetime-local" value={form.date_consultation || ''} onChange={(e) => setForm({ ...form, date_consultation: e.target.value })} required /></FormField>
          <FormField label="Diagnostic"><textarea value={form.diagnostic || ''} onChange={(e) => setForm({ ...form, diagnostic: e.target.value })} /></FormField>
          <FormField label="Notes"><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>
          <FormField label="Traitement"><textarea value={form.traitement || ''} onChange={(e) => setForm({ ...form, traitement: e.target.value })} /></FormField>
        </CrudModal>
      )}
    </div>
  )
}
