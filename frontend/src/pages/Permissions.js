import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import { rolePermissions } from '../data/permissions'

export default function Permissions() {
  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Securite"
        title="Permissions des roles"
        description="Regles d acces appliquees dans MedArchive pour proteger les dossiers medicaux"
      />

      <section className="permissions-grid">
        {rolePermissions.map((role) => (
          <article className="permission-card glass-card" key={role.role}>
            <header className="permission-header">
              <span className={`permission-icon ${role.tone}`}>
                <ShieldCheck size={24} />
              </span>
              <div>
                <Badge value={role.role} />
                <h2>{role.title}</h2>
                <p>{role.description}</p>
              </div>
            </header>

            <div className="permission-section">
              <h3>Autorisations</h3>
              <ul>
                {role.permissions.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="permission-section restrictions">
              <h3>Restrictions</h3>
              <ul>
                {role.restrictions.map((item) => (
                  <li key={item}>
                    <XCircle size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
