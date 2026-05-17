export default function StatCard({ icon: Icon, label, value, tone = 'blue' }) {
  return (
    <article className="stat-card glass-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={22} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  )
}
