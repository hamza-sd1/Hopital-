import { Outlet } from 'react-router-dom'
import TopNavbar from '../components/TopNavbar'
import UnpaidInvoiceAlert from '../components/UnpaidInvoiceAlert'

export default function AppLayout() {
  return (
    <>
      <TopNavbar />
      <UnpaidInvoiceAlert />
      <main className="app-shell">
        <Outlet />
      </main>
    </>
  )
}
