import { Bell, Check, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import SectionHeader from '../components/SectionHeader'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [apiOffline, setApiOffline] = useState(false)

  useEffect(() => {
    api
      .get('/notifications')
      .then(({ data }) => {
        setApiOffline(false)
        setNotifications(data.data || data)
      })
      .catch(() => setApiOffline(true))
  }, [])

  const markRead = async (notification) => {
    await api.patch(`/notifications/${notification.id_notification}/lu`)
    setNotifications((current) => current.map((item) => item.id_notification === notification.id_notification ? { ...item, lu: true } : item))
  }

  const remove = async (notification) => {
    if (!confirm('Supprimer cette notification ?')) return
    await api.delete(`/notifications/${notification.id_notification}`)
    setNotifications((current) => current.filter((item) => item.id_notification !== notification.id_notification))
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Inbox medicale"
        title="Notifications"
        description="Documents ajoutes, consultations et resultats disponibles"
      />
      <section className="notification-list">
        {notifications.length ? notifications.map((notification) => (
          <article className={`notification-item glass-card ${notification.lu ? '' : 'unread'}`} key={notification.id_notification}>
            <span className="notification-icon"><Bell size={18} /></span>
            <div>
              <strong>{notification.message}</strong>
              <p>{notification.date_creation?.slice(0, 10)}</p>
            </div>
            <div className="notification-actions">
              {!notification.lu && <button className="icon-btn" onClick={() => markRead(notification)}><Check size={16} /></button>}
              <button className="icon-btn danger" onClick={() => remove(notification)}><Trash2 size={16} /></button>
            </div>
          </article>
        )) : (
          <div className="empty-state glass-card">
            {apiOffline ? 'Backend indisponible.' : 'Aucune notification disponible.'}
          </div>
        )}
      </section>
    </div>
  )
}
