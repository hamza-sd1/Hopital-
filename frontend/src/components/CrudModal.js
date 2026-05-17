export default function CrudModal({ title, children, onClose, onSubmit, submitting = false }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card glass-card" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>x</button>
        </header>
        <form className="form-grid" onSubmit={onSubmit}>
          {children}
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>Annuler</button>
            <button type="submit" className="main-btn" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
