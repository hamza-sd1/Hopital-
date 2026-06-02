import SectionHeader from '../components/SectionHeader'
import { useCrud } from '../hooks/useCrud'

export default function Activites() {
  const { items, error } = useCrud('/activites')

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Journal" title="Activites" description="Historique des actions realisees sur la plateforme" />
      <section className="glass-card table-card">
        <table>
          <thead><tr><th>Utilisateur</th><th>Action</th><th>Description</th><th>Date</th></tr></thead>
          <tbody>
            {items.length ? items.map((item) => (
              <tr key={item.id_activite}><td>{item.user?.nom_complet || '-'}</td><td><strong>{item.action}</strong></td><td>{item.description || '-'}</td><td>{item.date_action?.slice(0, 16)}</td></tr>
            )) : <tr><td colSpan="4"><div className="empty-state">{error || 'Aucune activite.'}</div></td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  )
}
