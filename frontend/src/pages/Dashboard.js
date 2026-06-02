import { Activity, FileText, FolderOpen, Stethoscope, UserRound, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/useAuth'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'

const emptyStats = {
  nombre_patients: 0,
  nombre_medecins: 0,
  nombre_documents: 0,
  nombre_consultations: 0,
}

export default function Dashboard({ role }) {
  const { user } = useAuth()
  const [stats, setStats] = useState(emptyStats)
  const [chart, setChart] = useState([])
  const [apiOffline, setApiOffline] = useState(false)
  const [recentConsultations, setRecentConsultations] = useState([])
  const [recentError, setRecentError] = useState(false)
  const totalDocuments = chart.reduce((total, item) => total + Number(item.total || 0), 0)
  const mainDocumentType = chart.reduce((top, item) => (
    Number(item.total || 0) > Number(top?.total || 0) ? item : top
  ), null)

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then(({ data }) => {
        setApiOffline(false)
        setStats(data)
        setChart(
          data.documents_par_type?.map((item) => ({
            name: item.type?.nom_type || `Type ${item.id_type}`,
            total: item.total,
          })) || [],
        )
      })
      .catch(() => {
        setApiOffline(true)
        setStats(emptyStats)
        setChart([])
      })
  }, [])

  useEffect(() => {
    api
      .get('/consultations')
      .then(({ data }) => {
        const items = data.data || data
        setRecentError(false)
        setRecentConsultations(Array.isArray(items) ? items.slice(0, 5) : [])
      })
      .catch(() => {
        setRecentError(true)
        setRecentConsultations([])
      })
  }, [])

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow={role === 'admin' ? 'Dashboard' : `Espace ${role}`}
        title="Bienvenue sur MedArchive"
        description="Gestion centralisee des dossiers medicaux numeriques"
      />

      <section className="stats-grid">
        <StatCard icon={Users} label="Patients" value={stats.nombre_patients || 0} tone="blue" />
        <StatCard icon={UserRound} label="Medecins" value={stats.nombre_medecins || 0} tone="purple" />
        <StatCard icon={FileText} label="Documents" value={stats.nombre_documents || 0} tone="cyan" />
        <StatCard icon={Stethoscope} label="Consultations" value={stats.nombre_consultations || 0} tone="green" />
      </section>

      <section className="dashboard-grid">
        <article className="glass-card panel">
          <div className="panel-title">
            <h2>Resume des documents</h2>
            <span>{apiOffline ? 'Mode apercu' : 'Vue medicale'}</span>
          </div>
          <div className="documents-summary">
            {chart.length ? (
              <>
                <div className="documents-summary-head">
                  <div className="documents-summary-icon">
                    <FolderOpen size={24} />
                  </div>
                  <div>
                    <span>Total documents</span>
                    <strong>{totalDocuments}</strong>
                  </div>
                  <div>
                    <span>Type dominant</span>
                    <strong>{mainDocumentType?.name || '-'}</strong>
                  </div>
                </div>

                <div className="documents-type-list">
                  {chart.map((item) => {
                    const total = Number(item.total || 0)

                    return (
                      <div className="documents-type-item" key={item.name}>
                        <span>{item.name}</span>
                        <strong>{total}</strong>
                        <p>document{total > 1 ? 's' : ''}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state">Aucun document disponible pour le moment.</div>
            )}
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-title">
            <h2>Activite recente</h2>
            <span>{user?.nom_complet}</span>
          </div>
          <div className="activity-list">
            {recentConsultations.length ? recentConsultations.map((item) => (
              <div className="activity-item" key={item.id_consultation}>
                <span className="activity-dot"><Activity size={16} /></span>
                <div>
                  <strong>{item.diagnostic || 'Consultation medicale'}</strong>
                  <p>
                    {item.patient?.user?.nom_complet || 'Patient'} - {item.medecin?.user?.nom_complet || 'Medecin'}
                    {item.date_consultation ? ` - ${item.date_consultation.slice(0, 16)}` : ''}
                  </p>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                {recentError ? 'Backend indisponible.' : 'Aucune consultation recente.'}
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
