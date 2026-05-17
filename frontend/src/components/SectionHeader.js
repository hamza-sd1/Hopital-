export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <header className="section-header">
      <div className="section-heading-copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </header>
  )
}
