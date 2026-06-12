import { useState } from 'react'
import { TrendingUp, Shield, Zap, AlertCircle } from 'lucide-react'
import { getInvestmentOptions } from '../utils/api'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

const RISK_CONFIG = {
  conservative: { color: 'var(--accent-emerald)', label: 'Conservative', desc: 'Low risk, steady growth' },
  moderate: { color: 'var(--accent-cyan)', label: 'Moderate', desc: 'Balanced risk & return' },
  aggressive: { color: 'var(--accent-rose)', label: 'Aggressive', desc: 'High risk, high reward' },
}

export default function Invest({ store }) {
  const [options, setOptions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [risk, setRisk] = useState('moderate')
  const [savings, setSavings] = useState(Math.max(store.savings, 1000))

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await getInvestmentOptions(savings, risk)
      setOptions(r)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const riskColor = RISK_CONFIG[risk]?.color

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Investment Hub</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Personalized investment options for your savings</p>
      </div>

      {/* Config */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Your Investment Profile</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>Monthly Investment Amount (₹)</label>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
              <span style={{ color: 'var(--text-muted)' }}>₹</span>
              <input type="number" value={savings} onChange={e => setSavings(parseFloat(e.target.value) || 0)}
                className="bg-transparent outline-none flex-1 font-num font-bold text-lg" />
            </div>
          </div>
          <div>
            <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>Risk Profile</label>
            <div className="flex gap-2">
              {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setRisk(key)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: risk === key ? cfg.color + '20' : 'rgba(30,41,59,0.5)',
                    color: risk === key ? cfg.color : 'var(--text-muted)',
                    border: `1px solid ${risk === key ? cfg.color + '50' : 'transparent'}`,
                  }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={fetch} disabled={loading} className="btn-glow text-white text-sm font-medium px-6 py-2.5 rounded-xl flex items-center gap-2">
          <TrendingUp size={15} />
          {loading ? 'Getting recommendations…' : 'Get AI Recommendations'}
        </button>
      </div>

      {/* Monthly snapshot */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly Income', value: fmt(store.income), color: 'var(--accent-cyan)' },
          { label: 'Monthly Expenses', value: fmt(store.totalExpenses), color: 'var(--accent-rose)' },
          { label: 'Available to Invest', value: fmt(Math.max(store.savings, 0)), color: 'var(--accent-emerald)' },
        ].map(d => (
          <div key={d.label} className="glass-card p-4 text-center">
            <p className="font-num text-xl font-bold mb-1" style={{ color: d.color }}>{d.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
          </div>
        ))}
      </div>

      {/* Results */}
      {options && (
        <>
          {/* Allocation pie-like */}
          {options.allocation_suggestion && (
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-3">Suggested Allocation</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(options.allocation_suggestion).map(([name, pct]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-cyan)' }} />
                    <span className="text-sm">{name}</span>
                    <span className="font-num font-bold text-sm" style={{ color: 'var(--accent-cyan)' }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {options.options?.map((opt, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{opt.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-num font-bold" style={{ color: 'var(--accent-emerald)' }}>{opt.expected_return}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>expected return</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Shield size={12} />
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: opt.risk_level === 'low' ? 'rgba(16,185,129,0.15)' : opt.risk_level === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                      color: opt.risk_level === 'low' ? 'var(--accent-emerald)' : opt.risk_level === 'medium' ? 'var(--accent-amber)' : 'var(--accent-rose)',
                    }}>
                    {opt.risk_level} risk
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Min: <span className="font-num font-semibold">{fmt(opt.min_investment)}/mo</span></span>
                </div>

                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{opt.suitable_for}</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-emerald)' }}>Pros</p>
                    {opt.pros?.map((p, j) => <p key={j} className="text-xs" style={{ color: 'var(--text-muted)' }}>· {p}</p>)}
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(244,63,94,0.08)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-rose)' }}>Cons</p>
                    {opt.cons?.map((p, j) => <p key={j} className="text-xs" style={{ color: 'var(--text-muted)' }}>· {p}</p>)}
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--accent-cyan)' }}>How to start</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.how_to_start}</p>
                </div>
              </div>
            ))}
          </div>

          {options.disclaimer && (
            <div className="flex gap-2 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: 2 }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{options.disclaimer}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
