import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import { useCrud } from '../hooks/useCrud'

const empty = { id_destinataire: '', id_facture: '', sujet: '', contenu: '' }

export default function Messages() {
  const { user } = useAuth()
  const { items, error, reload } = useCrud('/messages')
  const canSend = ['admin', 'facturation'].includes(user?.role)
  const [patients, setPatients] = useState([])
  const [factures, setFactures] = useState([])
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!canSend) return

    api.get('/patients').then(({ data }) => setPatients(data.data || data)).catch(() => {})
    api.get('/factures').then(({ data }) => setFactures(data.data || data)).catch(() => {})
  }, [canSend])

  const markRead = async (message) => {
    await api.patch(`/messages/${message.id_message}/lu`)
    reload()
  }

  const submit = async (event) => {
    event.preventDefault()
    await api.post('/messages', form)
    setForm(null)
    reload()
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Messagerie"
        title="Messages et rappels"
        description="Rappels de paiement et messages administratifs"
        action={canSend && <button className="main-btn" onClick={() => setForm(empty)}><Plus size={18} />Nouveau</button>}
      />
      <section className="notification-list">
        {items.length ? items.map((message) => (
          <article className={`notification-item glass-card ${message.lu ? '' : 'unread'}`} key={message.id_message}>
            <span className="notification-icon">M</span>
            <div>
              <strong>{message.sujet}</strong>
              <p>{message.contenu}</p>
              <p>{message.date_envoi?.slice(0, 16)}</p>
            </div>
            {!message.lu && <button className="icon-btn" onClick={() => markRead(message)}><Check size={16} /></button>}
          </article>
        )) : <div className="empty-state glass-card">{error || 'Aucun message.'}</div>}
      </section>
      {form && (
        <CrudModal title="Envoyer un message" onClose={() => setForm(null)} onSubmit={submit}>
          <FormField label="Patient destinataire"><select value={form.id_destinataire} onChange={(e) => setForm({ ...form, id_destinataire: e.target.value })} required><option value="">Choisir</option>{patients.map((patient) => <option key={patient.id_patient} value={patient.id_user}>{patient.user?.nom_complet} - IP {patient.ip_patient || '-'}</option>)}</select></FormField>
          <FormField label="Facture liee"><select value={form.id_facture || ''} onChange={(e) => setForm({ ...form, id_facture: e.target.value })}><option value="">Optionnel</option>{factures.map((facture) => <option key={facture.id_facture} value={facture.id_facture}>{facture.reference} - {facture.patient?.user?.nom_complet}</option>)}</select></FormField>
          <FormField label="Sujet"><input value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })} required /></FormField>
          <FormField label="Message"><textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} required /></FormField>
        </CrudModal>
      )}
    </div>
  )
}
