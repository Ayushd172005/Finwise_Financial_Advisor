import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap } from 'lucide-react'
import { chatWithAdvisor } from '../utils/api'

const QUICK = [
  "How can I save more money this month?",
  "Should I invest in SIP or FD?",
  "How to build a ₹1 lakh emergency fund?",
  "Best ways to reduce my food expenses?",
  "Explain the 50/30/20 budget rule",
  "How to start investing with ₹2000/month?",
]

export default function Chat({ store }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm **FinBot**, your AI financial advisor. I have access to your expense data and financial goals. Ask me anything about budgeting, investing, or achieving your financial goals! 🚀" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const financialContext = {
    monthly_income: store.income,
    total_expenses: store.totalExpenses,
    savings: store.savings,
    savings_rate: store.savingsRate.toFixed(1) + '%',
    top_categories: Object.entries(store.expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}: ₹${v}`),
    goals: store.goals.map(g => `${g.name}: ₹${g.current_amount}/${g.target_amount}`),
  }

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)
    try {
      const apiMessages = updated.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
      const { reply } = await chatWithAdvisor(apiMessages, financialContext)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect right now. Please make sure the backend server is running." }])
    } finally { setLoading(false) }
  }

  const renderContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(6,182,212,0.15);color:var(--accent-cyan);padding:1px 5px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:0.85em">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Financial Advisor</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Chat with FinBot — powered by Claude AI</p>
      </div>

      {/* Quick questions */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => send(q)}
            className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.2)' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: m.role === 'user' ? 'linear-gradient(135deg,#0891b2,#7c3aed)' : '#1e293b', border: '1px solid #334155' }}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />}
            </div>
            <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'chat-user text-white' : 'chat-bot'}`}
              dangerouslySetInnerHTML={{ __html: renderContent(m.content) }} />
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 chat-bot">
              <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div className="chat-bot px-4 py-3 flex items-center gap-1.5">
              <span className="pulse-dot w-2 h-2 rounded-full bg-slate-400" />
              <span className="pulse-dot w-2 h-2 rounded-full bg-slate-400" />
              <span className="pulse-dot w-2 h-2 rounded-full bg-slate-400" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3" style={{ borderColor: 'rgba(6,182,212,0.3)' }}>
          <Zap size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder="Ask about budgeting, investing, saving…"
          />
        </div>
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="btn-glow text-white px-5 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
