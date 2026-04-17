import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, AlertTriangle, ShieldAlert } from 'lucide-react'
import { api } from '../api/client'
import PersonaBadge from '../components/PersonaBadge'

const CIRCLES = ['North', 'South', 'East', 'West']

function RiskBar({ score, max = 100 }) {
  const color = score <= 30 ? 'bg-green-500' : score <= 65 ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${(score / max) * 100}%` }} />
      </div>
      <span className="text-xs font-medium" style={{ color: score <= 30 ? '#22c55e' : score <= 65 ? '#d97706' : '#ef4444' }}>
        {Math.round(score)}
      </span>
    </div>
  )
}

export default function ConsumerList() {
  const [consumers, setConsumers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [circle, setCircle] = useState('')
  const [persona, setPersona] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const fetchConsumers = (extra = {}) => {
    setLoading(true)
    const params = { limit: 50, search, circle, persona_key: persona, ...extra }
    Object.keys(params).forEach(k => !params[k] && delete params[k])
    api.listConsumers(params)
      .then(d => { setConsumers(d.consumers); setTotal(d.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchConsumers()
  }, [circle, persona])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchConsumers()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Consumers</h1>
          <p className="text-sm text-gray-500">{total.toLocaleString()} consumers · April 2026</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or account..."
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
            Search
          </button>
        </form>

        <select
          value={circle}
          onChange={e => setCircle(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
        >
          <option value="">All Circles</option>
          {CIRCLES.map(c => <option key={c}>{c}</option>)}
        </select>

        <select
          value={persona}
          onChange={e => setPersona(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
        >
          <option value="">All Personas</option>
          <option value="chronic_defaulter">Chronic Defaulter</option>
          <option value="accidental_late_payer">Accidental Late Payer</option>
          <option value="at_risk_high_value">At-Risk High-Value</option>
          <option value="ombudsman_escalator">Ombudsman Escalator</option>
          <option value="bill_shock_prone">Bill Shock Prone</option>
          <option value="flexible_load_consumer">Flexible Load</option>
          <option value="ev_adopter">EV Adopter</option>
          <option value="digital_champion">Digital Champion</option>
          <option value="prompt_payer">Prompt Payer</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Consumer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Circle / Area</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Persona</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rev Risk</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Engagement</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Overdue</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : consumers.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No consumers found</td></tr>
            ) : consumers.map(c => (
              <tr
                key={c.id}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/consumers/${c.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.consumer_number}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  <div>{c.circle}</div>
                  <div className="text-gray-400">{c.area}</div>
                </td>
                <td className="px-4 py-3">
                  <PersonaBadge personaKey={c.primary_persona_key} personaName={c.primary_persona} />
                </td>
                <td className="px-4 py-3">
                  <RiskBar score={c.revenue_risk_score || 0} />
                </td>
                <td className="px-4 py-3">
                  <RiskBar score={c.engagement_score || 0} max={100} />
                </td>
                <td className="px-4 py-3">
                  {c.total_arrears > 0 ? (
                    <div>
                      <div className="text-red-600 font-medium">₹{c.total_arrears.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{c.days_overdue}d overdue</div>
                    </div>
                  ) : (
                    <span className="text-green-600 text-xs">Clear</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {c.regulatory_risk_flag && (
                      <ShieldAlert size={14} className="text-red-500" title="Regulatory Risk" />
                    )}
                    {c.monthly_bill_bucket === 'high' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">HV</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
