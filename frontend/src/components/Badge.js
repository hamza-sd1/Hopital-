const styles = {
  actif: 'badge badge-green',
  archive: 'badge badge-gray',
  attente: 'badge badge-orange',
  admin: 'badge badge-purple',
  medecin: 'badge badge-blue',
  patient: 'badge badge-cyan',
  facturation: 'badge badge-orange',
  inactif: 'badge badge-gray',
  non_payee: 'badge badge-orange',
  payee: 'badge badge-green',
  partiellement_payee: 'badge badge-blue',
  annulee: 'badge badge-gray',
}

export default function Badge({ value }) {
  const key = String(value || '').toLowerCase()
  return <span className={styles[key] || 'badge badge-gray'}>{String(value || '').replaceAll('_', ' ')}</span>
}
