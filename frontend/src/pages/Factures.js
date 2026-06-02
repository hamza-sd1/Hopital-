import { Bell, Edit, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import Badge from '../components/Badge'
import CrudModal from '../components/CrudModal'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../auth/useAuth'
import { useCrud } from '../hooks/useCrud'

const empty = {
  id_consultation: '',
  montant: '',
  statut_paiement: 'non_payee',
  date_facture: new Date().toISOString().slice(0, 10),
  date_paiement: '',
  notes: '',
}

export default function Factures() {
  const { user } = useAuth()
  const canManage = ['admin', 'facturation'].includes(user?.role)
  const { items, error, reload } = useCrud('/factures')
  const [consultations, setConsultations] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!canManage) return

    api.get('/consultations').then(({ data }) => setConsultations(data.data || data)).catch(() => {})
  }, [canManage])

  const openCreate = () => {
    setEditing(null)
    setSubmitError('')
    setForm(empty)
  }

  const close = () => {
    setEditing(null)
    setSubmitError('')
    setForm(null)
  }

  const getErrorMessage = (err) => {
    const errors = err.response?.data?.errors
    if (errors) return Object.values(errors).flat().join(' ')

    return err.response?.data?.message || "Impossible d'enregistrer la facture. Verifiez les champs."
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitting(true)

    try {
      if (editing) await api.put(`/factures/${editing.id_facture}`, form)
      else await api.post('/factures', form)
      await reload()
      close()
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const reminder = async (facture) => {
    await api.post(`/factures/${facture.id_facture}/rappel`)
    alert('Rappel envoye au patient.')
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Facturation"
        title="Factures patients"
        description="Suivi des paiements et rappels des consultations non payees"
        action={canManage && <button className="main-btn" onClick={openCreate}><Plus size={18} />Ajouter</button>}
      />
      <section className="glass-card table-card">
        <table>
          <thead><tr><th>Reference</th><th>Patient</th><th>IP Patient</th><th>Service</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length ? items.map((facture) => (
              <tr key={facture.id_facture}>
                <td><strong>{facture.reference}</strong></td>
                <td>{facture.patient?.user?.nom_complet || '-'}</td>
                <td>{facture.patient?.ip_patient || '-'}</td>
                <td>{facture.service?.nom_service || '-'}</td>
                <td>{facture.montant} DH</td>
                <td><Badge value={facture.statut_paiement} /></td>
                <td className="actions-cell">
                  {canManage && <button className="icon-btn" onClick={() => { setSubmitError(''); setEditing(facture); setForm({ ...facture, date_facture: facture.date_facture?.slice(0, 10) || '', date_paiement: facture.date_paiement?.slice(0, 10) || '' }) }}><Edit size={16} /></button>}
                  {canManage && facture.statut_paiement !== 'payee' && <button className="icon-btn" onClick={() => reminder(facture)}><Bell size={16} /></button>}
                </td>
              </tr>
            )) : <tr><td colSpan="7"><div className="empty-state">{error || 'Aucune facture.'}</div></td></tr>}
          </tbody>
        </table>
      </section>
      {form && <CrudModal title={editing ? 'Modifier facture' : 'Ajouter facture'} onClose={close} onSubmit={submit} submitting={submitting}>
        {!editing && <FormField label="Consultation"><select value={form.id_consultation || ''} onChange={(e) => setForm({ ...form, id_consultation: e.target.value })} required><option value="">Choisir</option>{consultations.filter((consultation) => !consultation.facture).map((consultation) => <option key={consultation.id_consultation} value={consultation.id_consultation}>{consultation.patient?.user?.nom_complet} - {consultation.date_consultation?.slice(0, 10)}</option>)}</select></FormField>}
        <FormField label="Montant"><input type="number" step="0.01" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required /></FormField>
        <FormField label="Date facture"><input type="date" value={form.date_facture || ''} onChange={(e) => setForm({ ...form, date_facture: e.target.value })} required /></FormField>
        <FormField label="Statut paiement"><select value={form.statut_paiement} onChange={(e) => setForm({ ...form, statut_paiement: e.target.value })}><option value="non_payee">Non payee</option><option value="partiellement_payee">Partiellement payee</option><option value="payee">Payee</option><option value="annulee">Annulee</option></select></FormField>
        <FormField label="Date paiement"><input type="date" value={form.date_paiement?.slice(0, 10) || ''} onChange={(e) => setForm({ ...form, date_paiement: e.target.value })} /></FormField>
        <FormField label="Notes"><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>
        {submitError && <div className="form-error modal-form-error">{submitError}</div>}
      </CrudModal>}
    </div>
  )
}
