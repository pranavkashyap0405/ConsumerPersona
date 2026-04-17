const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  // Consumers
  listConsumers: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return req(`/consumers${q ? '?' + q : ''}`)
  },
  getConsumer: (id) => req(`/consumers/${id}`),

  // Portfolio
  getPortfolio: () => req('/portfolio/summary'),
  getCircles: () => req('/portfolio/circles'),

  // Actions
  listActions: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return req(`/actions${q ? '?' + q : ''}`)
  },
  dispatchAction: (id) => req(`/actions/${id}/dispatch`, { method: 'POST' }),
  logOutcome: (id, outcome, notes) =>
    req(`/actions/${id}/outcome?outcome=${outcome}${notes ? '&notes=' + notes : ''}`, { method: 'POST' }),

  // DTs
  listDTs: () => req('/dt'),
  getDT: (id) => req(`/dt/${id}`),

  // KPIs
  getKPIs: () => req('/kpis'),

  // Chat
  chat: (message, sessionId) =>
    req('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    }).catch(() =>
      req(`/chat?message=${encodeURIComponent(message)}${sessionId ? '&session_id=' + sessionId : ''}`, { method: 'POST', body: '{}' })
    ),

  // Seed
  seed: () => req('/seed', { method: 'POST' }),
}
