import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Invest from './pages/Invest'
import Chat from './pages/Chat'
import { useFinanceStore } from './hooks/useFinanceStore'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const store = useFinanceStore()

  const pages = {
    dashboard: <Dashboard store={store} />,
    expenses: <Expenses store={store} />,
    budget: <Budget store={store} />,
    goals: <Goals store={store} />,
    invest: <Invest store={store} />,
    chat: <Chat store={store} />,
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar active={page} onSelect={setPage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen" style={{ maxHeight: '100vh' }}>
        {pages[page] || pages.dashboard}
      </main>
    </div>
  )
}
