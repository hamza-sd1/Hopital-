import { Outlet } from 'react-router-dom'
import TopNavbar from '../components/TopNavbar'
import UnpaidInvoiceAlert from '../components/UnpaidInvoiceAlert'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <TopNavbar />
      <UnpaidInvoiceAlert />
      <main className="app-shell">
        <Outlet />
      </main>
    </div>
  )
}
