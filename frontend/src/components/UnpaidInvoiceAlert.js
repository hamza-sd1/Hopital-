import { AlertTriangle, CreditCard, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'

export default function UnpaidInvoiceAlert() {
  const { user } = useAuth()
  const [factures, setFactures] = useState([])
  const [visible, setVisible] = useState(false)

  const sessionKey = useMemo(() => `medarchive_unpaid_alert_${user?.id_user || 'guest'}`, [user?.id_user])
  const total = factures.reduce((sum, facture) => sum + Number(facture.montant || 0), 0)

  useEffect(() => {
    if (user?.role !== 'patient') return
    if (sessionStorage.getItem(sessionKey) === 'closed') return

    api
      .get('/factures?statut_paiement=non_payee')
      .then(({ data }) => {
        const invoices = data.data || data
        setFactures(invoices)
        setVisible(invoices.length > 0)
      })
      .catch(() => {})
  }, [sessionKey, user?.role])

  const close = () => {
    sessionStorage.setItem(sessionKey, 'closed')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="invoice-alert-popover glass-card" role="alert">
      <button type="button" className="invoice-alert-close" onClick={close} aria-label="Fermer">
        <X size={16} />
      </button>
      <div className="invoice-alert-icon">
        <AlertTriangle size={22} />
      </div>
      <div className="invoice-alert-content">
        <span>Facture non payee</span>
        <h2>{factures.length} facture{factures.length > 1 ? 's' : ''} en attente</h2>
        <p>
          Montant total a regulariser : <strong>{total.toFixed(2)} DH</strong>
        </p>
        <Link className="invoice-alert-action" to="/patient/factures" onClick={close}>
          <CreditCard size={16} />
          Voir mes factures
        </Link>
      </div>
    </div>
  )
}
