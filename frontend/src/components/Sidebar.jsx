import { LayoutDashboard, Receipt, Target, TrendingUp, MessageCircle, Wallet } from 'lucide-react'

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'expenses', icon: Receipt, label: 'Expenses' },
  { id: 'budget', icon: Wallet, label: 'Budget' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'invest', icon: TrendingUp, label: 'Invest' },
  { id: 'chat', icon: MessageCircle, label: 'AI Advisor' },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col"
      style={{ background: 'rgba(10,15,30,0.95)', borderRight: '1px solid #1e293b', zIndex: 40 }}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-glow">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <span className="gradient-text font-bold text-lg">FinWise</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Finance Advisor</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
            style={{
              background: active === id ? 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(139,92,246,0.15))' : 'transparent',
              color: active === id ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: active === id ? '1px solid rgba(6,182,212,0.25)' : '1px solid transparent',
            }}
          >
            <Icon size={18} />
            <span className="font-medium text-sm">{label}</span>
            {id === 'chat' && (
              <span className="ml-auto w-2 h-2 rounded-full" style={{ background: 'var(--accent-emerald)' }} />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Powered by Claude AI
        </p>
      </div>
    </aside>
  )
}
