import { useState, useCallback } from 'react'

const CATEGORIES = [
  'Housing', 'Food & Dining', 'Transport', 'Shopping',
  'Entertainment', 'Healthcare', 'Education', 'Utilities',
  'Savings', 'Investment', 'Other'
]

const CATEGORY_COLORS = {
  'Housing': '#06b6d4',
  'Food & Dining': '#f59e0b',
  'Transport': '#8b5cf6',
  'Shopping': '#f43f5e',
  'Entertainment': '#10b981',
  'Healthcare': '#3b82f6',
  'Education': '#ec4899',
  'Utilities': '#6366f1',
  'Savings': '#14b8a6',
  'Investment': '#22c55e',
  'Other': '#94a3b8',
}

// Seed data for demo
const SEED_EXPENSES = [
  { id: '1', amount: 15000, category: 'Housing', description: 'Monthly rent', date: '2024-01-01' },
  { id: '2', amount: 4500, category: 'Food & Dining', description: 'Groceries', date: '2024-01-03' },
  { id: '3', amount: 2200, category: 'Food & Dining', description: 'Restaurants', date: '2024-01-10' },
  { id: '4', amount: 1800, category: 'Transport', description: 'Fuel & auto', date: '2024-01-05' },
  { id: '5', amount: 3500, category: 'Shopping', description: 'Clothes', date: '2024-01-12' },
  { id: '6', amount: 1200, category: 'Entertainment', description: 'OTT + movies', date: '2024-01-08' },
  { id: '7', amount: 800, category: 'Utilities', description: 'Electricity & internet', date: '2024-01-02' },
  { id: '8', amount: 500, category: 'Healthcare', description: 'Medical', date: '2024-01-15' },
]

const SEED_BUDGETS = [
  { category: 'Housing', limit: 15000, period: 'monthly' },
  { category: 'Food & Dining', limit: 6000, period: 'monthly' },
  { category: 'Transport', limit: 2000, period: 'monthly' },
  { category: 'Shopping', limit: 3000, period: 'monthly' },
  { category: 'Entertainment', limit: 1000, period: 'monthly' },
]

const SEED_GOALS = [
  { id: '1', name: 'Emergency Fund', target_amount: 150000, current_amount: 45000, deadline: '2024-12-31', priority: 'high' },
  { id: '2', name: 'Laptop Upgrade', target_amount: 80000, current_amount: 20000, deadline: '2024-06-30', priority: 'medium' },
  { id: '3', name: 'Vacation — Goa', target_amount: 30000, current_amount: 12000, deadline: '2024-04-01', priority: 'low' },
]

export function useFinanceStore() {
  const [expenses, setExpenses] = useState(SEED_EXPENSES)
  const [budgets, setBudgets] = useState(SEED_BUDGETS)
  const [goals, setGoals] = useState(SEED_GOALS)
  const [income, setIncome] = useState(60000)

  const addExpense = useCallback((expense) => {
    const newExpense = { ...expense, id: Date.now().toString() }
    setExpenses(prev => [newExpense, ...prev])
  }, [])

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }, [])

  const upsertBudget = useCallback((budget) => {
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category === budget.category)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = budget
        return copy
      }
      return [...prev, budget]
    })
  }, [])

  const addGoal = useCallback((goal) => {
    setGoals(prev => [...prev, { ...goal, id: Date.now().toString() }])
  }, [])

  const updateGoal = useCallback((id, updates) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  }, [])

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  // Derived stats
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const savings = income - totalExpenses
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name, value, color: CATEGORY_COLORS[name] || '#94a3b8'
  })).sort((a, b) => b.value - a.value)

  return {
    expenses, budgets, goals, income, setIncome,
    addExpense, deleteExpense, upsertBudget,
    addGoal, updateGoal, deleteGoal,
    totalExpenses, savings, savingsRate,
    expensesByCategory, chartData,
    CATEGORIES, CATEGORY_COLORS,
  }
}
