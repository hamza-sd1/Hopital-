import { FileText, HeartPulse, Stethoscope } from 'lucide-react'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import { consultations, documents, patients } from '../data/mockData'

export default function PatientRecord() {
  const patient = patients[0]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Dossier patient"
        title={patient.user.nom_complet}
        description="Resume medical, consultations, documents et informations essentielles"
      />
      <section className="patient-hero glass-card">
        <div className="profile-avatar">{patient.user.nom_complet.slice(0, 2)}</div>
        <div>
          <h2>{patient.user.nom_complet}</h2>
          <p>IP Patient {patient.ip_patient} - CIN {patient.cin} - Telephone {patient.telephone}</p>
          <Badge value="patient" />
        </div>
        <div className="quick-stats">
          <span><HeartPulse size={18} /> {patient.groupe_sanguin}</span>
          <span><Stethoscope size={18} /> {consultations.length} consultations</span>
          <span><FileText size={18} /> {documents.length} documents</span>
        </div>
      </section>
      <section className="tabs glass-card">
        <button className="active">Resume</button>
        <button>Consultations</button>
        <button>Documents</button>
        <button>Informations</button>
      </section>
      <section className="dashboard-grid">
        <article className="glass-card panel">
          <h2>Timeline medicale</h2>
          {consultations.map((item) => <p className="timeline-line" key={item.id_consultation}>{item.date_consultation} - {item.diagnostic}</p>)}
        </article>
        <article className="glass-card panel">
          <h2>Documents recents</h2>
          {documents.map((item) => <p className="timeline-line" key={item.id_document}>{item.titre} - {item.type.nom_type}</p>)}
        </article>
      </section>
    </div>
  )
}
