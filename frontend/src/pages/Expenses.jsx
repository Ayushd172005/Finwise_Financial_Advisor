import { useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

export default function Expenses({ store }) {
  const [form, setForm] = useState({ amount: '', category: store.CATEGORIES[1], description: '', date: new Date().toISOString().split('T')[0] })
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleAdd = () => {
    if (!form.amount || !form.description) return
    store.addExpense({ ...form, amount: parseFloat(form.amount) })
    setForm({ amount: '', category: store.CATEGORIES[1], description: '', date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
  }

  const filtered = store.expenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track every rupee you spend</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-glow text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">New Expense</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-num"
                placeholder="0" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
                {store.CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                placeholder="What did you spend on?" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-glow text-white text-sm font-medium px-5 py-2 rounded-xl">Save</button>
            <button onClick={() => setShowForm(false)} className="text-sm font-medium px-5 py-2 rounded-xl border" style={{ borderColor: '#334155', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search + Summary */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
            placeholder="Search expenses…" />
        </div>
        <div className="glass-card px-4 py-2.5 text-sm font-num font-semibold" style={{ color: 'var(--accent-rose)' }}>
          Total: {fmt(store.totalExpenses)}
        </div>
      </div>

      {/* Expense List */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Description', 'Category', 'Amount', ''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(30,41,59,0.4)'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{e.date}</td>
                <td className="px-5 py-3 text-sm font-medium">{e.description}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: (store.CATEGORY_COLORS[e.category] || '#94a3b8') + '20', color: store.CATEGORY_COLORS[e.category] || '#94a3b8' }}>
                    {e.category}
                  </span>
                </td>
                <td className="px-5 py-3 font-num font-semibold text-sm" style={{ color: 'var(--accent-rose)' }}>{fmt(e.amount)}</td>
                <td className="px-5 py-3">
                  <button onClick={() => store.deleteExpense(e.id)} className="opacity-40 hover:opacity-100 transition-opacity">
                    <Trash2 size={14} style={{ color: 'var(--accent-rose)' }} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No expenses found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
