import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const analyzeFinances = (data) => api.post('/analyze', data).then(r => r.data)
export const chatWithAdvisor = (messages, financialContext) =>
  api.post('/chat', { messages, financial_context: financialContext }).then(r => r.data)
export const getBudgetSuggestions = (data) => api.post('/budget-suggestions', data).then(r => r.data)
export const getInvestmentOptions = (savings, risk) =>
  api.get('/investment-options', { params: { monthly_savings: savings, risk_profile: risk } }).then(r => r.data)
