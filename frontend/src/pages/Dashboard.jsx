import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Target, Zap, ArrowRight } from 'lucide-react'
import { analyzeFinances } from '../utils/api'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

function StatCard({ label, value, sub, trend, color }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-num text-2xl font-bold mb-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend >= 0
            ? <TrendingUp size={12} color="var(--accent-emerald)" />
            : <TrendingDown size={12} color="var(--accent-rose)" />}
          <span className="text-xs" style={{ color: trend >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ store }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const result = await analyzeFinances({
        expenses: store.expenses,
        budgets: store.budgets,
        goals: store.goals,
        income: store.income
      })
      setAnalysis(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const healthColor = analysis?.budget_health === 'good'
    ? 'var(--accent-emerald)'
    : analysis?.budget_health === 'warning'
    ? 'var(--accent-amber)'
    : 'var(--accent-rose)'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your financial overview at a glance</p>
        </div>
        <button onClick={runAnalysis} disabled={loading} className="btn-glow text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Zap size={15} />
          {loading ? 'Analyzing…' : 'AI Analysis'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={fmt(store.income)} color="var(--accent-cyan)" />
        <StatCard label="Total Expenses" value={fmt(store.totalExpenses)} color="var(--accent-rose)" />
        <StatCard
          label="Net Savings"
          value={fmt(store.savings)}
          color={store.savings >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}
          sub={`${store.savingsRate.toFixed(1)}% of income`}
        />
        <StatCard label="Transactions" value={store.expenses.length} color="var(--accent-violet)" sub="this month" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Pie */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Expense Breakdown</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={store.chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {store.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {store.chartData.slice(0, 6).map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                  </div>
                  <span className="font-num text-xs font-medium">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={store.chartData.slice(0, 7)} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                formatter={(v) => [fmt(v), '']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {store.chartData.slice(0, 7).map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Analysis Result */}
      {analysis && (
        <div className="glass-card p-6 animate-border">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
              <Zap size={14} color="white" />
            </div>
            <h3 className="font-semibold">AI Financial Analysis</h3>
            <span className="ml-auto text-xs px-3 py-1 rounded-full font-medium" style={{ background: healthColor + '20', color: healthColor }}>
              {analysis.budget_health?.toUpperCase()} • {analysis.budget_score}/100
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Insights */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>KEY INSIGHTS</p>
              <ul className="space-y-2">
                {analysis.insights?.map((ins, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span style={{ color: 'var(--accent-cyan)' }}>→</span>
                    <span style={{ color: 'var(--text-muted)' }}>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Recommendations */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>TOP RECOMMENDATIONS</p>
              <ul className="space-y-2">
                {analysis.recommendations?.slice(0, 3).map((rec, i) => (
                  <li key={i} className="glass-card p-3" style={{ background: 'rgba(30,41,59,0.5)' }}>
                    <p className="text-xs font-semibold mb-0.5">{rec.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rec.description}</p>
                    <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                      style={{ background: rec.impact === 'high' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: rec.impact === 'high' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {rec.impact} impact
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Investment */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>INVESTMENT SUGGESTION</p>
              {analysis.investment_suggestion && (
                <div className="glass-card p-4" style={{ background: 'rgba(30,41,59,0.5)', borderColor: 'rgba(16,185,129,0.3)' }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--accent-emerald)' }}>{analysis.investment_suggestion.type}</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{analysis.investment_suggestion.reason}</p>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Monthly</span>
                    <span className="font-num font-bold" style={{ color: 'var(--accent-emerald)' }}>{fmt(analysis.investment_suggestion.monthly_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: 'var(--text-muted)' }}>Expected return</span>
                    <span style={{ color: 'var(--accent-amber)' }}>{analysis.investment_suggestion.expected_return}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {store.expenses.slice(0, 6).map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                  style={{ background: (store.CATEGORY_COLORS[e.category] || '#94a3b8') + '20', color: store.CATEGORY_COLORS[e.category] || '#94a3b8' }}>
                  {e.category[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{e.description}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.category} · {e.date}</p>
                </div>
              </div>
              <span className="font-num font-semibold text-sm" style={{ color: 'var(--accent-rose)' }}>-{fmt(e.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
