import { useState } from 'react'
import { Plus, Trash2, Target, Plus as PlusIcon } from 'lucide-react'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

const PRIORITY_COLORS = {
  high: { bg: 'rgba(244,63,94,0.15)', text: 'var(--accent-rose)' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: 'var(--accent-amber)' },
  low: { bg: 'rgba(16,185,129,0.15)', text: 'var(--accent-emerald)' },
}

export default function Goals({ store }) {
  const [showForm, setShowForm] = useState(false)
  const [addAmount, setAddAmount] = useState({})
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '', priority: 'medium' })

  const handleAdd = () => {
    if (!form.name || !form.target_amount || !form.deadline) return
    store.addGoal({ ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount) || 0 })
    setForm({ name: '', target_amount: '', current_amount: '0', deadline: '', priority: 'medium' })
    setShowForm(false)
  }

  const handleContribute = (id) => {
    const amount = parseFloat(addAmount[id] || 0)
    if (!amount) return
    const goal = store.goals.find(g => g.id === id)
    store.updateGoal(id, { current_amount: goal.current_amount + amount })
    setAddAmount(a => ({ ...a, [id]: '' }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Set targets, track progress, achieve them</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-glow text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Create Goal</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Goal Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                placeholder="e.g., Emergency Fund, Vacation, New Laptop" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Target Amount (₹)</label>
              <input type="number" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-num"
                placeholder="100000" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Already Saved (₹)</label>
              <input type="number" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-num"
                placeholder="0" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-glow text-white text-sm font-medium px-5 py-2 rounded-xl">Create Goal</button>
            <button onClick={() => setShowForm(false)} className="text-sm font-medium px-5 py-2 rounded-xl border" style={{ borderColor: '#334155', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Goal cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {store.goals.map(g => {
          const pct = Math.min((g.current_amount / g.target_amount) * 100, 100)
          const remaining = g.target_amount - g.current_amount
          const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 86400))
          const monthsLeft = Math.max(Math.ceil(daysLeft / 30), 1)
          const needed = remaining / monthsLeft
          const pc = PRIORITY_COLORS[g.priority]
          const barColor = pct >= 100 ? 'var(--accent-emerald)' : pct >= 60 ? 'var(--accent-cyan)' : pct >= 30 ? 'var(--accent-amber)' : 'var(--accent-rose)'

          return (
            <div key={g.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(139,92,246,0.15))' }}>
                    <Target size={18} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>
                      {g.priority} priority
                    </span>
                  </div>
                </div>
                <button onClick={() => store.deleteGoal(g.id)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <Trash2 size={14} style={{ color: 'var(--accent-rose)' }} />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span className="font-num font-semibold" style={{ color: barColor }}>{pct.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Saved', value: fmt(g.current_amount), color: 'var(--accent-emerald)' },
                  { label: 'Target', value: fmt(g.target_amount), color: 'var(--text-primary)' },
                  { label: 'Remaining', value: fmt(remaining), color: 'var(--accent-amber)' },
                ].map(d => (
                  <div key={d.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(30,41,59,0.5)' }}>
                    <p className="font-num font-bold text-sm" style={{ color: d.color }}>{d.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Deadline: <span className="font-medium" style={{ color: daysLeft < 30 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{g.deadline}</span>
                {' '}· Need <span className="font-num font-semibold" style={{ color: 'var(--accent-cyan)' }}>{fmt(needed)}/mo</span> for {monthsLeft} months
              </p>

              {/* Contribute */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-3 flex-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>₹</span>
                  <input type="number" value={addAmount[g.id] || ''} onChange={e => setAddAmount(a => ({ ...a, [g.id]: e.target.value }))}
                    className="bg-transparent py-1.5 text-sm outline-none flex-1 font-num" placeholder="Add amount" />
                </div>
                <button onClick={() => handleContribute(g.id)} className="btn-glow text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <PlusIcon size={12} /> Add
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {store.goals.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Target size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p className="font-semibold mb-1">No goals yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first financial goal to start tracking progress</p>
        </div>
      )}
    </div>
  )
}
