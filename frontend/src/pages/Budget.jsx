import { useState } from 'react'
import { Lightbulb, Plus } from 'lucide-react'
import { getBudgetSuggestions } from '../utils/api'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

export default function Budget({ store }) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ category: store.CATEGORIES[0], limit: '' })

  const getSuggestions = async () => {
    setLoading(true)
    try {
      const r = await getBudgetSuggestions({ expenses: store.expenses, budgets: store.budgets, income: store.income })
      setSuggestions(r)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSave = () => {
    if (!form.limit) return
    store.upsertBudget({ category: form.category, limit: parseFloat(form.limit), period: 'monthly' })
    setForm({ category: store.CATEGORIES[0], limit: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget Planner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Set limits, stay on track</p>
        </div>
        <button onClick={getSuggestions} disabled={loading} className="btn-glow text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Lightbulb size={15} />
          {loading ? 'Thinking…' : 'AI Suggestions'}
        </button>
      </div>

      {/* Income setting */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Monthly Income</p>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-muted)' }}>₹</span>
            <input type="number" value={store.income} onChange={e => store.setIncome(parseFloat(e.target.value) || 0)}
              className="bg-transparent border-b border-slate-600 focus:border-cyan-500 outline-none font-num font-bold text-xl w-32" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-3 ml-6">
          {[
            { label: 'Needs (50%)', amount: store.income * 0.5, color: 'var(--accent-cyan)' },
            { label: 'Wants (30%)', amount: store.income * 0.3, color: 'var(--accent-violet)' },
            { label: 'Savings (20%)', amount: store.income * 0.2, color: 'var(--accent-emerald)' },
          ].map(d => (
            <div key={d.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(30,41,59,0.5)' }}>
              <p className="font-num font-bold text-lg" style={{ color: d.color }}>{fmt(d.amount)}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add budget */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-3">Set Budget Limit</h3>
        <div className="flex gap-3">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
            {store.CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
            <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
              className="bg-transparent py-2 text-sm outline-none w-28 font-num" placeholder="Limit" />
          </div>
          <button onClick={handleSave} className="btn-glow text-white text-sm font-medium px-5 py-2 rounded-xl flex items-center gap-2">
            <Plus size={14} /> Set
          </button>
        </div>
      </div>

      {/* Budget cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {store.budgets.map(b => {
          const spent = store.expensesByCategory[b.category] || 0
          const pct = Math.min((spent / b.limit) * 100, 100)
          const over = spent > b.limit
          const color = pct > 90 ? 'var(--accent-rose)' : pct > 70 ? 'var(--accent-amber)' : 'var(--accent-emerald)'
          return (
            <div key={b.category} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: (store.CATEGORY_COLORS[b.category] || '#94a3b8') + '20', color: store.CATEGORY_COLORS[b.category] || '#94a3b8' }}>
                    {b.category[0]}
                  </div>
                  <span className="font-medium text-sm">{b.category}</span>
                </div>
                {over && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)' }}>Over budget</span>}
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Spent: <span className="font-num font-semibold" style={{ color }}>{fmt(spent)}</span></span>
                <span style={{ color: 'var(--text-muted)' }}>Limit: <span className="font-num font-semibold">{fmt(b.limit)}</span></span>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Suggestions */}
      {suggestions && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={16} style={{ color: 'var(--accent-amber)' }} />
            AI Budget Recommendations
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
            {suggestions.suggested_budgets?.map(s => (
              <div key={s.category} className="p-3 rounded-xl" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid #334155' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{s.category}</span>
                  <span className="font-num text-sm font-bold" style={{ color: 'var(--accent-cyan)' }}>{fmt(s.suggested_limit)}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.reasoning}</p>
              </div>
            ))}
          </div>
          {suggestions.key_adjustments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>KEY ADJUSTMENTS</p>
              <ul className="space-y-1">
                {suggestions.key_adjustments.map((a, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span style={{ color: 'var(--accent-cyan)' }}>→</span>
                    <span style={{ color: 'var(--text-muted)' }}>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
